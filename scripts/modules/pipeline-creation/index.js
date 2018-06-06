const yaml = require("js-yaml")
const fs = require("fs")

const maxRecursiveIterations = process.env.RECURSIVE_ITERATIONS || 10
let currentRecursiveIndex = 0
const directory = yaml.load(fs.readFileSync(`${process.cwd()}/../../../modules/directory.yaml`), 'utf8')

try {
  const file = yaml.load(fs.readFileSync(`${process.cwd()}/base.yaml`, 'utf8'))
  
  // Fetch sample stages
  const sampleStage = file.Resources.Pipeline.Properties.Stages[1]
  
  // Fetch installed modules
  const installedModulesStr = process.env.INSTALLED_MODULES
  if (!installedModulesStr) {
    throw 'ERROR: Failed to fetch installed modules'
  }
  
  const installedModules = installedModulesStr.split(',')
  console.log(installedModules)
  
  // Analyze dependencies
  const stages = []
  const satisfied = []
  const stage0 = {
    Modules: []
  }
  for (let i = 0; i < installedModules.length; i++) {
    const moduleName = installedModules[i]
    const module = directory.Modules.filter(item => item.Name === moduleName)[0]
    if (!module) {
      throw `ERROR: Unexisting module definition for module ${moduleName}`
    }
    
    const dependencies = module.Consumes
    if (!dependencies.length) {
      stage0.Modules.push(moduleName)
      satisfied.push(moduleName)
    }
    const dependencyDescription = {}
    let ready = true
    for (let f = 0; f < dependencies.length; f++) {
      const dependencyName = dependencies[f]
      const dependency = directory.Modules.filter(item => item.Name === dependencyName)[0]
      if (!dependency) {
        throw `ERROR: Unknown dependency ${dependencyName} for module ${moduleName}`
      }
      
      const dependencySatisfied = !!dependency.Core || satisfied.indexOf(dependencyName) !== -1
      dependencyDescription[dependencyName] = dependencySatisfied
      if (!dependencySatisfied) ready = false
    }
    
    console.log(`Analyzing module ${moduleName}`)
    
    if (!ready) {
      console.log('INFO: Module not ready')
      module.$satisfaction = dependencyDescription
      console.log('INFO: Module not satisfied', moduleName)
      console.log(module.$satisfaction)
    } else {
      console.log('INFO: Module ready')
      satisfied.push(moduleName)
      stage0.Modules.push(moduleName)
    }
  }
  
  stages.push(stage0)
  console.log(stage0)
  processPendingModules(stages, satisfied)
  console.log(stages)
  
} catch(e) {
  console.error(e)
}

function processPendingModules(stages, satisfied) {
  const stage = {
    Modules: []
  }
  
  const pending = directory.Modules.filter(item => !!item.$satisfaction)
  if (!pending.length) {
    console.log('INFO: Module dependency resolution finished.')
    return
  }
  
  for (let i = 0; i < pending.length; i++) {
    const module = pending[i]
    const moduleName = module.Name
    const dependencies = module.Consumes
    
    console.log(`INFO: Processing module ${moduleName}`)
    
    const dependencyDescription = {}
    let ready = true
    for (let f = 0; f < dependencies.length; f++) {
      const dependencyName = dependencies[f]
      const dependency = directory.Modules.filter(item => item.Name === dependencyName)[0]
      if (!dependency) {
        throw `ERROR: Unknown dependency ${dependencyName} for module ${moduleName}`
      }
      
      const dependencySatisfied = !!dependency.Core || satisfied.indexOf(dependencyName) !== -1
      dependencyDescription[dependencyName] = dependencySatisfied
      if (!dependencySatisfied) ready = false
    }
    
    if (!ready) {
      console.log('INFO: Module not ready')
      module.$satisfaction = dependencyDescription
      console.log('INFO: Module not satisfied', moduleName)
      console.log(module.$satisfaction)
    } else {
      console.log('INFO: Module ready')
      satisfied.push(moduleName)
      stage.Modules.push(moduleName)
    }
    
    stages.push(stage)
  }
  
  if (++currentRecursiveIndex > maxRecursiveIterations) {
     throw 'ERROR: Maximum recursivity reached. Check your modules.'
  }
}