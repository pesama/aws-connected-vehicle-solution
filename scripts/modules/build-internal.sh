#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/../.."
modules_dir="${project_dir}/modules"
tmp_bucket="${TMP_BUCKET:-none}"

if [[ "none" = "$tmp_bucket" ]]; then
  echo "ERROR: Parameter `TMP_BUCKET` is mandatory, and not given."
  echo "ERROR: Setup the environment variable `TMP_BUCKET` for calling this script"
  exit 1
fi

module_name=${1:-none}
if [[ "none" = $module_name ]]; then
  echo "ERROR: Parameter module_name is mandatory, and not given."
  echo "USAGE: `bash ${script_dir}/build-internal.sh module_name` output_dir"
  exit 1
fi

output_dir=${2:-none}
if [[ "none" = $output_dir ]]; then
  echo "ERROR: Parameter output_dir is mandatory, and not given."
  echo "USAGE: `bash ${script_dir}/build-internal.sh module_name` output_dir"
  exit 1
fi

module_dir=${modules_dir}/$module_name
if [[ ! -d $module_dir ]]; then
  echo "ERROR: Module ${module_name} does not exist in the core repository"
  exit 1
fi

if [[ ! -f $module_dir/cloudformation.yaml ]]; then
  echo "ERROR: Module ${module_name} does not have a `cloudformation.yaml` for resource definition."
  exit 1
fi 

echo "INFO: Copying module"
cp -R $module_dir $output_dir/$module_name

if [[ ! -f $module_dir/buildspec.build.yaml ]]; then
  echo "INFO: Module does not have a custom build process. Packaging template now."
  bash $script_dir/package-internal.sh $module_name $output_dir
fi

echo "INFO: Successfully starting module installation"