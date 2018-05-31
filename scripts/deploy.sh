#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."

source $script_dir/config.sh

echo "INFO: Deploying resume stack"
echo "INFO: Packaging template"
aws cloudformation package \
  --s3-bucket $TMP_BUCKET \
  --template-file $project_dir/infra/cloudformation.yaml \
  --output-template-file $project_dir/infra/cloudformation.pkg.yaml
prev_code=$(echo $?)
if [ "0" != $prev_code ]; then
  echo "ERROR: Failed to package template."
  exit 1
fi

echo "INFO: Deploying stack"
aws cloudformation deploy \
  --template-file $project_dir/infra/cloudformation.pkg.yaml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM
prev_code=$(echo $?)
if [ "0" != $prev_code ]; then
  echo "ERROR: Failed to deploy stack."
  exit 1
fi

echo "INFO: Successfully deployed resume stack."