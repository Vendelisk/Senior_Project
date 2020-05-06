# Online Compiler and Limited Terminal
Web platform that supports account and file creation, file uploads, search and terminal interface.

## For admin contributors
Welcome to the Team!

Server installation and how to:

The actual code of the server lives in ```/var/www/senior_project```,
everything should be there.

Mongodb is located at ```/usr/bin```
run: ```mongod``` to get the database up and running
run: ```mongodb``` to look at the data in the database. Look up the rest of the commands if using it
run: ```node /var/www/senior_project/server.js``` to spawn the front-end

make you are connecting to the db via port ```27017``` to do this
just uncomment the mongoose connect close to line 20
and comment the other line that says mongoose connect
