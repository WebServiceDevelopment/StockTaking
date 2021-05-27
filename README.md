# StockTaking 

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Stock Taking](https://github.com/WebServiceDevelopment/StockTaking/blob/main/Assets/stocktaking_banner.png?raw=true)

This is a repository for the Web Service Development application
'Stock Taking'. The application is a three teir application with
grunts on the bottom, managers in the middle, and admins on the
top. The admins are requires for making stock locations, creating
staff (grunts and managers), and assigning managers to a location.
The admins also control what kind of inventory is expected for
each location.

Each month a list of inventory reports is generated for each 
location. And the manager assigns a grunt to a report 
for that month. The grunt will complete the report on a
tablet device such as an iPad, and submit the report
to the manager for verification. The manager will login
and verify the report, and is given the options to make adjustments
if needed (changes are tracked). Once the manager is satisfied
with the report, the manager submits the report to the 
admin for a final check.

Once the admin confirms all of the reports for the month, 
the reports can be finalized. Once the reports are finalized
they are archived and can be downloaded as CSV files such that
they can be openned and edited with Excel. 

## Repository Structure

This repository contains three folders, **Assets**, **ClientSample**, 
**Deploy** and **Screenshots**.   

The **Assets** folder contains a list of images of the characters
that appear in this project. Specifically, the difference between
a game, and a real-world application like this, is that in a game
you generally assume the role of a character in a different
world via an avatar. In business applications, the people carrying out
their respective tasks in the real world are the _characters_, as such
we tried to create pictures and images to represent what's expected
of each _character's_ role, and how the application is intended to 
structure the business.

The **ClientSample** is a stand-alone version sample of the client
interface that does not interact with the backend server. That way
anyone who wants to quickly test and get a feel for the application
can view this single page to see if they want to continue to install
a full version of the application. 

The **Deploy** folder contains the all of the source code for
running and deploying the full version of the application. Information
on how to install the full version is included in this README. Information
on how to initialize the application is included in the **Deploy** folder's
read me file. And information on how to setup and manage the application is
included in this repository's wiki.

The **Screenshots** folder contains preview images to show the layout of
the application, and also includes images that are referenced in this
Repository's Wiki. 

## Installation

The Stock Taking application has been designed to be as simple
as possible with the least amount of requirements possible.
Only Nodejs (for the application) and Redis (for sessions) is
required. Now that I think about it, I could probably move
sessions into a memory or file with session manager and remove
the requirement for Redis.

To deploy an environment. You will need a domain name, and a server
with a web-facing IP address. For the IP address we will use
_stock.wsd.sh_, please replace this with with your domain.
For a server, we will use a Linode VPS, though your welcome
to use any other VPS service such as Digital Ocean or Vultr.
Otherwise self hosting on your own hardware is also acceptable.
In terms of specs, this application will run on low end hardware,
so single core, 512MB of memory, and 25GB of storage will likely
run this application with no issues.

### Install on CentOS / Fedora / Redhat

Install Git

```
$ sudo dnf install git
```

```
$ sudo dnf install nginx
$ sudo systemctl start nginx
$ sudo systemctl enable nginx
```

Install Nodejs

```
$ sudo dnf module install nodejs
$ sudo dnf module reset nodejs
$ sudo dnf module list nodejs

Last metadata expiration check: 0:09:23 ago on Thu 27 May 2021 01:37:53 AM UTC.
CentOS Linux 8 - AppStream
Name           Stream        Profiles                                     Summary                  
nodejs         10 [d]        common [d], development, minimal, s2i        Javascript runtime       
nodejs         12            common [d], development, minimal, s2i        Javascript runtime       
nodejs         14            common [d], development, minimal, s2i        Javascript runtime       

$ sudo dnf module enable nodejs:14
$ sudo dnf install nodejs
$ node -v
v14.16.0
```

Install Redis

```
$ sudo dnf install redis
$ sudo systemctl start redis.service
$ sudo systemctl enable redis.service
```

### Prepare Nginx with Let's Encrypt

```
$ sudo firewall-cmd --permanent --add-service=http
$ sudo firewall-cmd --permanent --add-service=https
$ sudo firewall-cmd --reload
$ sudo setsebool -P httpd_can_network_connect 1
```

```
$ sudo vim /etc/nginx/conf.d/stock.wsd.sh.conf
--- Create File With these contents ---

server {
	
	listen       80;
	listen       [::]:80;
	server_name  stock.wsd.sh;
	root         /usr/share/nginx/html;

	location ^~ /.well-known/acme-challenge/ {
		default_type "text/plain";
	}

	location / {
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header HOST $http_host;
		proxy_set_header X-NginX-Proxy true;
		proxy_pass http://127.0.0.1:4000;
		proxy_redirect off;
	}

}

--- End Contents ---
$ sudo nginx -t
$ sudo systemctl restart nginx
```

```
$ sudo dnf install epel-release
$ sudo dnf install certbot python3-certbot-nginx
$ sudo certbot --nginx -d stock.wsd.sh
```

```
# npm install pm2 -g
# cd /srv
# git clone git clone https://github.com/WebServiceDevelopment/StockTaking.git
# cd /srv/StockTaking/Deploy
# npm install
# pm2 start StockTaking.js

PM2] Spawning PM2 daemon with pm2_home=/root/.pm2
[PM2] PM2 Successfully daemonized
[PM2] Starting /srv/StockTaking/Deploy/StockTaking.js in fork_mode (1 instance)
[PM2] Done.
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ StockTaking        │ fork     │ 0    │ online    │ 0%       │ 31.3mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

(Optional) Automatically start StockStaking service on start up in case server
needs to power down or reboot.

```
# pm2 startup
# pm2 save
```

## Walkthrough

The walkthrough is a series of videos that describes how to setup and
use the application. The list of videos will be updated as needed or implemented.

- [ ] Setup a Test Environment
- [ ] Setup a Deployment
- [ ] Initialize the Application
- [ ] Create a New Location
- [ ] Assign Staff to the Location
- [ ] Assign Grunt to Report
- [ ] Fill Out and Submit Report
- [ ] Validate and Confirm Report
- [ ] Review and Return Report
- [ ] Review and Confirm Report
- [ ] Download Report as CSV
- [ ] Finalize Monthly Reports

## License

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Copyright

Copyright © Web Service Development Inc. 2020, 2021
