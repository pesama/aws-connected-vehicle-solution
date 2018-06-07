#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/../.."

source $script_dir/../config.sh

tmp_bucket="${TMP_BUCKET:-none}"

if [ "none" = $tmp_bucket ]; then
  echo "ERROR: Parameter `TMP_BUCKET` is mandatory, and not given."
  echo "ERROR: Setup the environment variable `TMP_BUCKET` for calling this script"
  exit 1
fi

echo "INFO: Packaging core template"
package_cmd=$(aws cloudformation package \
  --s3-bucket=${tmp_bucket} \
  --template-file ${project_dir}/infra/bundle.yaml \
  --output-template-file ${project_dir}/infra/bundle.pkg.yaml)
prev_code=$(echo $?)
if [ "0" != $prev_code ]; then
  echo "ERROR: Failed to package CloudFormation template."
  echo $package_cmd
  exit 1
fi

echo "INFO: Core template successfully packaged."