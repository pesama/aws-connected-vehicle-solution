# Connected Vehicle Modular architecture

Welcome to the modules documentation of the Connected Vehicle Solution. This documentation below goes deep on our modular architecture, and how modules fit together to create a comprehensive system.

This documentation would be quite useful to you if you are planning to contribute to the connected vehicle solution, especially if you plan to craft new modules.

## Overview

### All are modules

All features of the Connected Vehicle Solution are modularised. This simplifies the development of features as it dramatically reduces the scope of impact of changes made; and virtually removes the boundaries for solution's customisation, as new features could simply be added as modules.

Modules interact with other modules for using part of their functionality, avoiding any duplication of features. If a module interacts with other module we say that is _dependent_ on such module, or that it _consumes_ it. Therefore, the producing module _produces_ some reusable features. There is a [formal definition](#module-definition) of modules and their dependencies, worth checking out if you plan to build your own.

### Service agreement consumption

As every feature is packed as a module, producer modules create service agreements that define how other modules can consume their features, to simplify module development and understanding. We have written a [module documentation standard](#documenting-modules) that describes how modules must be documented for best public understanding.

### Infrastructure as Code

Most modules will include within their resources some cloud infrastructure, that will be spun up when the module is installed on the solution. This infrastructure should always be defined as code, in CloudFormation templates, that will be automatically deployed by the cicd system. Check out the [module anatomy](#module-anatomy) section to find out how modules are structured.

## Module definition

Every module is, in essence, a folder. This folder must contain all definition, software components and other assets required for the module to work. This folder can either reside locally - i.e. at the Connected Vehicle Solution's repository - or in an external git repository.

### Defining models

The first thing we must do for crafting a module is create a definition file. This file - that resides on the root folder of the component, and must be called `module.yaml` - contains all information needed for understanding what the module does, which modules it consumes, and other metadata worth including in its definition. You can find a very simple example file below.

```yaml
# module.yaml
---
Name: my-module
Description: My module does amazing things with vehicles.
Consumes:
  - auth
  - fleet
  - telemetry
Produces:
  -
    Name: connected-vehicle-my-module-my-output-1
    Description: Name of the output I export from my module.
```

### Documenting models

TODO

## Module anatomy

Every module should follow a certain file structure for allowing the system to interact appropriately in all deployments of the Connected Vehicle Solution. The first file must be present on all modules is the module definition file - i.e. `module.yaml`.

### Infrastructure

All the infrastructure required for your module to work must be defined as code, in an AWS CloudFormation template. This template - that shall reside at the root folder, and be called `cloudformation.yaml` - is picked by the build system to spin up your module's infrastructure as the module gets installed or updated. Your module can _consume_ other modules' infrastructure by importing the values exported by such modules. See the [documenting modules](#documenting-modules) section to find out how to know a module's exports.

This CloudFormation template uses Change sets for deployments and updates, so any CloudFormation [transformation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html) could be used for your module's infrastructure.

### Building procedures

Modules may need a build procedure prior to deployment so the deployed artifact includes the built version of the module. This procedure is taken care by AWS CodeBuild, and the build definition is defined as a [build spec](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html), in a file called `buildspec.build.yaml`. If you specify this file at your module's root folder, your module will execute the defined build procedure prior to deployment.

TODO Auto package?

### Data population procedures

Once modules are deployed, they may need to have some data population tasks performed for them to work correctly - e.g. inserting master data. This task is handled by AWS CodeBuild and the process is defined in a `buildspec.data.yaml` file, at the root's folder.

TODO Permissions?
TODO Why not Lambda?

## Module installation

Once you've described your module, it can be installed into a Connected Vehicle Solution's deployment. 

TODO Describe mechanism to update directory

```yaml
# modules/directory.yaml
Modules:
  ...
  -
    Name: my-module
    Consumes:
      - auth
      - fleet
      - telemetry
    Produces:
      - connected-vehicle-my-module-my-output-1
    Location:
      Type: local|git
      Source: auth|git@github.com:myself/my-module.git
```