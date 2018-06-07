# Connected Vehicle inSync solution

The Connected Vehicle inSync setup mode is the recommended installation procedure if you plan to use the system for more than just a fit-test, as it's especifically intended for productive systems. The main benefit of using this approach for deploying the solution is that you will always have an updated copy of the system as new releases come along.

## Overview

We have made the Connected Vehicle Solution completely modular for two reasons: empower the community to release modules without interacting with a big monolith, and to allow all the moving pieces that - result from this modular architecture - to behave, evolve, and be managed independently. 

The inSync setup, instead of deploying the solution's resources directly, it will place continuous delivery pipelines into your AWS, whose main duty is to deploy the solution for you. These pipelines would not only create the resources when you create it; it will keep your resources in sync with the repository's last version, so you can have always the latest version of the system and all its modules, without any hassle.

## Setup flow

When you first deploy the solution using this method, the continuous delivery resources for the core system will be deployed. Instants thereafter, the pipeline should kick off and setup your system. This is the process it follows:

### Source checkout

This step will be called first upon any pipeline execution. It will fetch the code from the repository, and store it as a pipeline artifact, that will be picked up at later stages.

### Solution preparation

This stage will package the core resources configuration template and fetch the configuration you've input. It will use this configuration to create a template for defining your solution's architecture. This will include a second continuous delivery pipeline, responsible for spinning up all your modules once the core is deployed.

### Core create/update

At this stage the core template is ready and it will be spun up, so you will have successfully installed the core of the Connected Vehicle solution.

### Module deployment

Once the core is ready, the pipeline we created at an earlier stage will start executing, creating the resources needed for each and every module to work.

_NOTE: This second pipeline will only execute when you change the system's module definition - i.e. you add or remove a module into/from the system. The modules themselves have their own in-sync capabilities, so they will update themselves moving forward._

## Continuous delivery flow

Once the solution is deployed and new updates come along, the system will react to them by getting the latest version and deploying it. The process will vary depending on what's actually changed.

### Core changes

When a new version of the core - i.e. any of the core modules - appears, your core pipeline will automatically start and deploy it - the process for this would be very similar to the one described at [setup flow](#setup-flow). Unless there is any update in the module definition system, the second pipeline should not execute.

### Altering installed modules

When you change an installed module, effectively you are changing the core. Hence, the core pipeline will start, and the module definition pipeline will be changed to match your module requirements. Once this is done, your new modules will start installing, and the removed ones will be deleted.

### Updates on modules

Updates on modules should not affect the core pipeline at all. Every module that follows the inSync approach should have their own systems to detect new versions on the module and react to them. This will normally involve a pipeline per-module into your account, each reacting to changes to its own repository.

## Creating an inSync module

TODO