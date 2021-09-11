#!/bin/bash
echo "------------------------------"
echo "INSTALLING: Production Dependencies!"
echo "------------------------------"
echo "                              "
yarn --production
echo "                              "
echo "------------------------------"
echo "INSTALLING: Complete!"
echo "------------------------------"
echo "                              "
echo "LAUNCHING: Bean-Dashboard-API."
echo "                              "
echo "------------------------------"

yarn build

yarn start