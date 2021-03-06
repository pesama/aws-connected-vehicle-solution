const yaml = require("js-yaml")
const fs = require("fs")

const basePath = `${process.cwd()}/../../..`
const maxRecursiveIterations = process.env.RECURSIVE_ITERATIONS || 10
let currentRecursiveIndex = 0
const directory = yaml.load(fs.readFileSync(`${basePath}/modules/directory.yaml`), 'utf8')

const baseTemplate = yaml.load(fs.readFileSync(`${process.cwd()}/base.yaml`, 'utf8'))

// Fetch solution name
let solutionNameTmp = process.env.SOLUTION_NAME
if (!solutionNameTmp) {
  console.log('WARN: SOLUTION_NAME is not set. Using default value `ConnectedVehicleModules`')
  solutionNameTmp = 'ConnectedVehicleModules'
}
const solutionName = solutionNameTmp

// Fetch installed modules
const installedModulesStr = `${process.env.CORE_MODULES},${process.env.INSTALLED_MODULES}`
if (!installedModulesStr) {
  throw 'ERROR: Failed to fetch installed modules'
}

const installedModules = installedModulesStr.split(',')

let sortModeInverse = false

const sortFunction = (a, b) => {
  // Determine if modules are resolved
  const aResolved = isModuleResolved(a)
  const bResolved = isModuleResolved(b)
  
  // Determine dependencies
  const aDependant = isModuleDependant(a, b)
  const bDependant = isModuleDependant(b, a)
  
  if (aResolved && !bResolved) {
    return -1
  } 
  
  if (bResolved && !aResolved) {
    return 1
  }
  
  if (aResolved && bResolved) {
    return 0
  }
  
  if (aDependant && bDependant) {
    throw `ERROR: Circular dependency between ${a} and ${b} found.`
  }
  
  if (aDependant) {
    return 1
  }
  
  if (bDependant) {
    return -1
  }
  
  if (sortModeInverse) {
    return 1
  } else {
    return -1
  }
  
}

const sortedModulesA = installedModules.sort(sortFunction)
sortModeInverse = true
const sortedModulesB = installedModules.sort(sortFunction)

console.log(sortedModulesA)

const sortedModules = sortedModulesA

const stages = []

// Populate first stage with resolved modules
const firstStageModules = sortedModules.filter(moduleName => {
  const module = directory.Modules.filter(item => item.Name === moduleName)[0]
  if (!module) {
    throw `ERROR: Module ${moduleName} not resolved`
  }
  
  return isModuleResolved(moduleName)
})
stages.push({
  Name: 'Deploy0',
  Modules: firstStageModules
})

const unresolvedModules = sortedModules.filter(moduleName => {
  const module = directory.Modules.filter(item => item.Name === moduleName)[0]
  if (!module) {
    throw `ERROR: Module ${moduleName} not resolved`
  }
  
  return !isModuleResolved(moduleName)
})

let currentStage = {
  Name: 'Deploy1',
  Modules: []
}

for (let i = 0; i < unresolvedModules.length; i++) {
  const moduleName = unresolvedModules[i]
  const module = directory.Modules.filter(item => item.Name === moduleName)[0]
  if (!module) {
    throw `ERROR: Module ${moduleName} not resolved`
  }
  
  const dependencies = module.Consumes || []
  
  // Is the module already resolved in previous stages?
  const allResolutions = concatArrays(stages.map(item => item.Modules))
  
  let resolved = true
  for (let f = 0; f < dependencies.length; f++) {
    const dependency = dependencies[f]
    if (allResolutions.indexOf(dependency) === -1) {
      // Module can't deploy yet
      resolved = false
      break
    }
  }
  
  if (resolved) {
    // Module was resolved previously. Append to currentStage
    currentStage.Modules.push(moduleName)
    console.log(`INFO: Module ${moduleName} is ready. Adding to stage`)
  } else if (isModuleResolved(moduleName, [].concat(allResolutions, currentStage.Modules))) {
    console.log('INFO: ')
    // Module was resolved in this stage. Append new stage for it.
    console.log(`INFO: Module ${moduleName} resolves after this stage. Creating a new one for it`)
    stages.push(currentStage)
    currentStage = {
      Name: `Deploy${stages.length}`,
      Modules: [
        moduleName
      ]
    }
  } else {
    // Module is still not ready.
    console.log(`WARN: Module ${moduleName} is not ready yet.`)
  }
}

stages.push(currentStage)

console.log(JSON.stringify(stages, null, 2))
console.log('INFO: Finished sorting dependencies.')

const sourceStage = {
  Name: 'Source',
  Actions: installedModules.map(moduleName => {
    const module = directory.Modules.filter(item => item.Name === moduleName)[0]
    const location = module.Location.Type
    const source = module.Location.Source
    let action = null
    switch (location) {
      case 'local':
        action = {
          Name: `${moduleName}Source`,
          ActionTypeId: {
            Category: 'Source',
            Owner: 'AWS',
            Provider: 'S3',
            Version: '1'
          },
          Configuration: {
            PollForSourceChanges: false,
            S3Bucket: {
              'Fn::ImportValue': 'connected-vehicle-cicd-artifacts-bucket'
            },
            S3ObjectKey: `core/system/${moduleName}.zip`
          },
          OutputArtifacts: [{
            Name: `${moduleName}SourceCode`
          }],
          RunOrder: 1
        }
        break;
      case 'github':
        // TODO
        break;
    }

    return action
  })
}

const deploymentStages = stages.map((item, moduleIndex) => {
  const modules = item.Modules
  const stage = {
    Name: item.Name,
    Actions: concatArrays(modules.map((module, index) => {
      const stackName = `${solutionName}-module-${module}`
      const changesetName = `deploy${new Date().getTime()}`
      return [
        {
          Name: `${module}ModulePreparation`,
          ActionTypeId: {
            Category: 'Deploy',
            Owner: 'AWS',
            Provider: 'CloudFormation',
            Version: '1'
          },
          Configuration: {
            ActionMode: 'CHANGE_SET_REPLACE',
            StackName: stackName,
            ChangeSetName: changesetName,
            TemplatePath: `SourceCode::${module}.yaml`,
            RoleArn: {
              'Fn::GetAtt': 'PipelineDeploymentRole.Arn'
            },
            Capabilities: 'CAPABILITY_IAM'
          },
          InputArtifacts: [
            {
              Name: `${module}SourceCode`
            }
          ],
          RunOrder: 1
        },
        {
          Name: `${module}ModuleDeployment`,
          ActionTypeId: {
            Category: 'Deploy',
            Owner: 'AWS',
            Provider: 'CloudFormation',
            Version: '1'
          },
          Configuration: {
            ActionMode: 'CHANGE_SET_EXECUTE',
            StackName: stackName,
            ChangeSetName: changesetName,
            RoleArn: {
              'Fn::GetAtt': 'PipelineDeploymentRole.Arn'
            }
          },
          RunOrder: 2
        }//,
        // {
        //   // Wait for module deployment?
        // }
      ]
    }))
  }
  
  return stage
})
console.log('INFO: Stage definition created successfully')

const stageObject = baseTemplate.Resources.Pipeline.Properties.Stages
if (!stageObject) {
  stageObject = baseTemplate.Resources.Pipeline.Properties.Stages = []
}

console.log('INFO: Including source stage')
stageObject.push(sourceStage)

console.log('INFO: Including deployment stages')
stageObject.push.apply(stageObject, stageDefinitions)

console.log('INFO: Modules template ready. Saving file...')

fs.writeFileSync(`${basePath}/output/modules.json`, JSON.stringify(baseTemplate, null, 2), { flag: 'w' })

function isModuleResolved(moduleName, resolvedDependencies) {
  const module = directory.Modules.filter(item => item.Name === moduleName)[0]
  if (!module) {
    throw `ERROR: Module ${moduleName} not resolved`
  }
  
  const dependencies = module.Consumes || []
  
  if (!resolvedDependencies) {
    return !dependencies.length 
  }
  
  const unresolved = dependencies.filter(item => resolvedDependencies.indexOf(item) === -1)
  return !unresolved.length
}

function isModuleDependant(sourceName, targetName) {
  const module = directory.Modules.filter(item => item.Name === sourceName)[0]
  if (!module) {
    throw `ERROR: Module ${sourceName} not resolved`
  }
  
  const dependencies = module.Consumes || []
  return dependencies.indexOf(targetName) !== -1
}

function concatArrays (input) {
  let ret = []
  for (let i = 0; i < input.length; i++) {
    const item = input[i]
    if (item instanceof Array) {
      ret = ret.concat(item)
    } else {
      ret.push(item)
    }
  }

  return ret
}