#!/bin/sh
# demo >> image_name="10.168.1.142/smart-university-v2/venue-manage"
image_name="10.168.1.47:30002/box/admin-box"
image_version="v1.0.0"
echo $image_name:$image_version
docker rm -f $image_name
docker rmi -f $image_name:$image_version
docker build -t $image_name:$image_version .
docker push $image_name:$image_version
echo "successful"