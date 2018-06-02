#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/../.."
modules_dir="${project_dir}/modules"
tmp_bucket="${TMP_BUCKET:-none}"

if [ "none" = $tmp_bucket ]; then
  echo "ERROR: Parameter `TMP_BUCKET` is mandatory, and not given."
  echo "ERROR: Setup the environment variable `TMP_BUCKET` for calling this script"
  exit 1
fi

module_name=${1:-none}
if [ "none" = $module_name ]; then
  echo "ERROR: Parameter module_name is mandatory, and not given."
  echo "USAGE: `bash ${script_dir}/modules/build-internal.sh module_name`"
  exit 1
fi

module_dir=${modules_dir}/$module_name
if [ ! -d $module_dir ]; then
  echo "ERROR: Module ${module_name} does not exist in the core repository"
  exit 1
fi

if [ ! -f $module_dir/cloudformation.yaml ]; then
  echo "ERROR: Module ${module_name} does not have a `cloudformation.yaml` for resource definition."
  exit 1
fi 

echo "INFO: Packaging ${module_name} template"
package_cmd=$(aws cloudformation package \
  --s3-bucket=${tmp_bucket} \
  --template-file ${module_dir}/cloudformation.yaml \
  --output-template-file ${module_dir}/cloudformation.pkg.yaml)
prev_code=$(echo $?)
if [ "0" != $prev_code ]; then
  echo "ERROR: Failed to package CloudFormation template."
  echo $package_cmd
  exit 1
fi

echo "INFO: Successfully packaged template"