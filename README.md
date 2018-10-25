# AWS Connected Vehicle Solution
The AWS Connected Vehicle Solution is a reference implementation that provides a foundation for automotive product transformations for connected vehicle services, autonomous driving, electric powertrains, and shared mobility. It has a built-in core that serves the centric functions of a connected vehicle, and is modular and fully extensible so you can adapt it to your needs.

## Getting started
### One time installation
The simplest way to deploy the Connected Vehicle solution is through the one time installation. You will get a version of the system deployed within your AWS account in a matter of minutes, with just a few clicks in the AWS console.

The one time install uses a pre-packaged CloudFormation template that defines the resources needed for the system to work. Please click on the “Launch Stack” button corresponding to the AWS region you’d like the solution deployed to. If you don’t know or just want to test the system’s capabilities, we recommend you to use North Virginia - us-east-1.

**TODO**
Region        | Launch
 ------        | ------
 _us_east_1_   | ![Launch stack](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)
 _eu_west_1_   | ![Launch stack](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)

_NOTE: The one-time setup approach is recommended for rapidly evaluating the solution. The system deployed will include out-of-the-box all the system’s core functionalities and most-common modules, ready for use to use._

### Sync installation
The Connected Vehicle solution is an open source platform that you can easily contribute to. As this project aims to be community-driven, you may find it to have a quite swift evolution, and new features being included at a fast pace. And of course, you’d like these features right into your deployment automatically, don’t you?

The sync installation leverages continuous delivery components to check out all the new features incorporated to the solution upon a new release, and rebuild your deployment automatically to keep it always up to date. The provisioning flow is quite similar to the one-time flow, but it has a bit of preparatory work. Please read through to configure this deployment flavor.

#### Get your Github’s OAuth token
The Connected Vehicle solution’s source code is stored on GitHub, and the sync installation uses AWS CodePipeline to check the artifacts out from the solution’s repository. In order for CodePipeline to communicate effectively with GitHub for checking out the source code. Please follow [these instructions](TODO-link) to create your OAuth token.

#### Launch the inSync stack
The procedure for installing the solution using this method is also straightforward, and relies on CloudFormation for the resource spin-up. Click on the appropriate button below, and follow the process.

**TODO**
Region        | Launch
 ------        | ------
_us_east_1_   | ![Launch stack](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)
_eu_west_1_   | ![Launch stack](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)

During the configuration of the stack, you’d need to provide some information to customize your copy of the Connected Vehicle solution:
* **TODO**.
* **Core modules:** This field must stay with its default value.
* **Installed modules:** Determines which additional modules should be installed in your deployed copy.
* **Repository Owner:** Who owns the repository with the source code. Change this value if using your own fork of the solution instead of the mainstream one.
* **Repository Name:** Change this value if you’ve stored the solution in a repository with a different name - you will need to change the Owner’s value too.
* **OAuth token**: Your GitHub token, created on the previous step.

#### Wait for the solution to deploy
Instead of directly deploying all the components part of the Connected Vehicle solution, this approach will deploy the continuous integration system. This system will update your deployment every time a new release is launched. The first time you deploy the solution, this system will kick off automatically and deliver the latest release into your account.

### Install from source
If you’d rather deploy the solution yourself into your account by using just the source code, you also can. Just clone this repository into your workspace and follow these instructions:

* **Configure the source:** The file `scripts/config.sh` includes the deployment configuration for the Connected Vehicle solution, when deployed using scripts. Change these values accordingly:
	* _STACK_NAME_: How the solution will be named in your account.
	* _AWS_PROFILE_: What AWS profile to use - i.e. your CLI credentials. If you only have one, the value of this attribute should be `default`.
	* _AWS_REGION_: Determines where - which AWS region - should the script use to deploy the solution.
	* _TMP_BUCKET_: Name of a bucket used for storing temporary files.
	* _OAUTH_TOKEN_: GitHub’s OAuth token.
* **Run the deployment script:** Run `bash scripts/deploy.sh {deploymentType}`  within the solution’s repository. The variable `deploymentType` can either be _one-time_ or _in-sync_, defaulting to the latter.
* **Wait for the solution to deploy.**

## Modules
The Connected Vehicle Solution aims to be a reference architecture detailing how we envision internet-connected automobiles to look like from a cloud/device architectural standpoint. It brings years of subject-matter expertise into  automotive and cloud technology, to ease getting started on connecting and administering large fleet of vehicles.

In order to maximize the usability of the solution, we have created a highly modular architecture. This architecture will allow you to fully customize the connected vehicle experience to your needs, by cherry-picking which modules make the most sense to your solution. We have made available to you several modules that we consider would be the most used across all connected vehicle solutions, and we have set strong foundations for enabling any contributor to create and release their own modules, that can seamlessly integrate into the solution’s core and leverage other modules.

### Core Modules
Core modules are those without which the system would not behave appropriately. They include - by definition - centric functionalities and features that would be intensively used by the system as a whole. The modules included _by default_ within the core modules list are **auth**, **fleet** and **telemetry**.
* **auth:** The auth module controls the authentication and authorization for all users of the Connected Vehicle Solution. Whenever a user tries to perform **any** operation within the system, this module will be leveraged.
* **fleet:** This module includes features for enabling the management of the fleet. This module is responsibility of storing and administering all fleet vehicles and their components, configuration and data. It will be consumed by virtually any module that uses or manages any vehicle/fleet information.
* **telemetry:** The telemetry module handles the mechanisms the vehicles use to communicate to the cloud. It sets the foundations for automatic data routing and grouping depending on its nature. This module is used by every vehicle that wishes to transmit information to the cloud.

The core modules have no anatomical difference with any other. This means that you can easily extend the solution by creating a new module, and declaring it as core. However, removing any of these aforementioned modules would result in system’s loss of stability.

### Internal modules
This repository contains not only the core modules for the solution, but also other modules that - whilst may not be paramount for the system to work - include some of the most-common features that would be present in virtually any connected vehicle.

* **anomalies**: TODO
* **api**: TODO
* **driver-safety**: Controls the drivers distractions for the duration of the trips, assigning a score to the driver's behavior for each trip.
* **dtc**: Handles the Diagnostic Trouble Code information exchange between the vehicle and the cloud.
* **jitr**: Configures your system for automatically onboarding large quantity of vehicles.
* **notifications**: Manages the cloud-to-user messages for event notifications.
* **poi**: Enables you to create Marketing Points-of-Interest, showing particular information to users based on location.

_NOTE: If you want to incorporate an internal module for the system, please check out the Contributing guide for more information about how to submit a Pull Request._

### Known 3rd party modules
TODO

### Module reference

If you are planning on contributing to the solution and want to know more about the modular architecture we use, check the [Modules](/MODULES.md) page.
