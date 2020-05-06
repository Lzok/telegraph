#!/usr/bin/env sh
# $0 is a script name, 
# $1, $2, $3 etc are passed arguments  # $1 is our command 
#ENVIRONMENT=$1

case "$NODE_ENV" in  
    "development" )
		exec npm run dev 
		;;
		
	"production" ) 
	exec npm run prod 
	;;
esac