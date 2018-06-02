# AWS Connected Vehicle Solution

The AWS Connected Vehicle Solution is a reference implementation that provides a foundation for automotive product transformations for connected vehicle services, autonomous driving, electric powertrains, and shared mobility. It has a built-in core that serves the centric functions of a connected vehicle, and is modular and fully extensible so you can adapt it to your needs.

## Getting Started

To get started with the AWS Connected Vehicle Solution, please review the solution documentation. https://aws.amazon.com/answers/iot/connected-vehicle-solution/

### Deploying the system

You can easily deploy the system by launching the core stack, by clicking on one of the launch stack buttons you can find below.

**TODO**
| Region        | Launch |
| ------        | ------ |
| _us_east_1_   | ![Launch stack](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png) |
| _eu_west_1_   | ![Launch stack](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png) |

## Solution overview

The Connected Vehicle solution is a fully modular system to allow you to customize the capabilities of your deployment to adapt it as much as possible to your needs. This architecture also allow you - and the community - to create modules that can easily be integrated into the solution for including additional features.

### Connected Vehicle core

To homogenize the way the solution is deployed, even the core functionalities are represented as modules. These modules are not optional, but having this architecture also allows you to modify the core of the solution, if you plan to have multiple deployments with different sets of features.

These are the current core modules:
* **auth**: Controls authentication and authorization of users for the whole system. 
* **telemetry**: Handles the mechanisms with which the vehicle interchanges telemetry information with the cloud and other system modules.
* **vehicles**: Stores the information about the fleet of vehicles.

### Default modules

We have made available a set of modules that include some of the most common functionalities for connected vehicles. When creating your deployment, you can configure the modules configured by creating a comma-delimited list of values with all modules you'd like to include. These modules sit in the same repository as the core infrastructure.

* **anomalies**: TODO
* **driver-safety**: Controls the drivers distractions for the duration of the trips, assigning a score to the driver's behavior for each trip.
* **dtc**: Handles the Diagnostic Trouble Code information exchange between the vehicle and the cloud.
* **jitr**: Configures your system for automatically onboarding large quantity of vehicles.
* **notifications**: Manages the cloud-to-user messages for event notifications.
* **poi**: Enables you to create Marketing PoI, showing particular information based on location

### 3rd party modules

* **time-series**: TODO

_Have you published a module and it's not on this list? Share it with the community! Send us a PR with your module incldued in the list above. See the [Contributing guide](/CONTRIBUTE.md) for more info._

### Module anatomy

TODO

***

Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
