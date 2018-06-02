#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/../.."

module_list_str=${1:-none}
if [ "none" = "$module_list_str" ]; then
  echo "ERROR: Parameter module_list is mandatory, and not given."
  echo "USAGE: bash ${script_dir}/modules/build-all.sh module_list output_dir"
  exit 1
fi

output_dir=${2:-none}
if [ "none" = $output_dir ]; then
  echo "ERROR: Parameter output_dir is mandatory, and not given."
  echo "USAGE: bash ${script_dir}/modules/build-all.sh module_list output_dir"
  exit 1
fi

# TODO Implement 3rd party
for module in $(echo "${module_list_str}" | jq -r '.[]'); do
  bash $script_dir/build-internal.sh $module
  prev_code=$(echo $?)
  if [ "0" != $prev_code ]; then
    echo "ERROR: Failed to build module $module."
    exit 1
  fi

  echo "INFO: Successfully packaged module $module"
  mv $project_dir/modules/$module/cloudformation.pkg.yaml $output_dir/$module.yaml
done

echo "INFO: Successfully packaged modules"