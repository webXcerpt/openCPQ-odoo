Setting up a Test Environment for *openCPQ* in Odoo
===================================================

For now we don't want to bother with the details of an Odoo setup nor with
possible compatibility issues.  So we set up Odoo in a virtual machine with
controlled state.  After the basic setup (operating system, utility software,
Odoo, repository access) we make a snapshot of the virtual machine so that a new
version of our own code can be installed on top of that with relatively little
effort and network traffic.


Setting up the Base System
--------------------------

(In some of the following steps you have to make sure to choose the 32-bit or
64-bit variant appropriately.  I only tested these instructions for the 64-bit
architecture.)

- Get VirtualBox for your operating system from
  https://www.virtualbox.org/wiki/Downloads and install it on your machine.
- Get an Ubuntu 15.10 image for VirtualBox from http://www.osboxes.org/ubuntu/
  and extract the contained VDI file.
- Start the VirtualBox manager.
  - Creating the virtual machine:
    - Click the "New" button.
    - Choose a name (e.g. "openCPQ-odoo-test"), the type "Linux" and version
      "Ubuntu" (32 or 64 bit as appropriate).
    - Select an amount of memory.  (I used 1024 MB.)
    - Hard disk: Select "Use an existing virtual hard disk" and click the folder
      icon to the right of the disk menu.  Select the VDI file you unpacked
      earlier.
	- Click "Create" to actually create the virtual machine.
  - Start the virtual machine by double-clicking it.
    - When it has booted log in as user "osboxes"
	  (full name "osboxes.org"; this user is preselected anyway)
	  with password "osboxes.org".
- In the virtual machine:
  - After a while the system suggests to complete the language support.
    Click "Run this action now", then "Update", but not "Install".
	When the language data has been updated, choose "English (United States)"
	before "English" and click "Apply system-wide".  (Password required!)
	Finally close the two dialog windows.
  - Select a keyboard:
    "En" to the right in the title bar > "Text Entry Settings...".
    I added German and removed English.
  - Click the "Software Updater" icon in the toolbar on the left
    (an "A" in a circle on green background, also takes a while before it
	appears, maybe only after playing with the "Software & Updates" system
	settings.)
	and confirm that you want Ubuntu to be updated.
	When the updater suggests to restart the machine, do so.
	*[Possibly not needed.]*
  - In the VirtualBox menu bar select
    "Devices" > "Insert Guest Additions CD Image...".
	When Ubuntu detects the (virtual) CD, click "Run" and type the password
	once more.
	When you're asked to press Return to close the window, do so.
	Then right-click the CD icon in the toolbar and select "Eject".
  - Now restart the machine (gear icon in the top-right corner >
	"Shut Down..." > restart icon) and log in again.
	<br>
	*[After logging in again I got an error message that some vbox-related
	service could not be started.]*
  - In the VirtualBox menu bar make sure that "View" > "Autoresize Guest Display"
    is enabled.  Then you can enlarge the VirtualBox window with your mouse
	and the display inside the VirtualBox should grow accordingly.
  - In the VirtualBox menu enable
    "Devices" > "Shared Clipboard" > "Bidirectional"
	so that you can easily copy commands from this document to your virtual
	machine.
  - Start a terminal.
    (Click the violet Ubuntu icon in the toolbar and type "terminal".
	Select the "Terminal" application.)
  - In the terminal:
    - Install Chrome

	  ```sh
	  sudo apt-get install libxss1 libappindicator1 libindicator7
	  wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
	  sudo dpkg -i google-chrome*.deb
	  ```
	- Install Git and Wkhtmltopdf:

	  ```sh
	  sudo apt-get install git wkhtmltopdf
	  ```
      If you are asked for the password, it's again "osboxes.org".
	- Install Odoo:

	  ```sh
	  wget -O- https://raw.githubusercontent.com/odoo/odoo/9.0/odoo.py \
	  | python
	  ```
	  Get a coffee while it installs.
    - Install node and npm:

	  ```sh
	  wget -O- https://nodejs.org/dist/v4.4.0/node-v4.4.0-linux-x64.tar.xz \
	  | tar xvfJ -
	  ```
	- Make the binaries available to the shell:

	  ```sh
	  ln -s node-v4.4.0-linux-x64/bin .
	  ```
	  Now log out and log in again so that the shell detects the `bin` directory.
	- Install npm packages which are apparently needed by odoo but not installed
	  automatically by the odoo installer:

	  ```sh
	  npm install -g less less-plugin-clean-css
	  ```
    - Install the openCPQ/Odoo integration:

	  ```sh
	  git clone https://github.com/webXcerpt/openCPQ-odoo.git
	  ```
    - Install the optical-networks demo:

	  ```sh
	  git clone https://github.com/webXcerpt/openCPQ-example-optical-transport.git
	  cd openCPQ-example-optical-transport
	  npm install # This takes a while.
	  # Don't use the openCPQ version from npm, but from github:
	  cd node_modules
	  mkdir HIDE
	  mv opencpq HIDE
	  git clone https://github.com/webXcerpt/openCPQ.git
	  mv openCPQ opencpq
	  cd opencpq
	  npm install # This takes a while.
	  npm run compile
	  cd
	  ```
	- Serve the configurator: Right-click into the terminal window and open
	  another terminal.  In the new terminal

	  ```sh
	  cd openCPQ-example-optical-transport
	  npm run dev-server
	  ```
	- Start Odoo:  Right-click into the first terminal window and open another
	  terminal.  In the new terminal

	  ```sh
	  cd odoo
	  ./odoo.py \
	    --database=odoo_test1 \
		--db-filter="^odoo" \
	    --addons-path=./addons,../openCPQ-odoo \
		-i product_opencpq,product_opencpq_layout
	  ### -i installs the specified modules and their dependencies. 
	  ### You could do this manually in the browser as well 
	  ```
	- Next time, you can use the "upward" cursor key to retrieve the start 
	  command in the shell, so you need not retype it.
  - Start Firefox or Chrome and open `localhost:8069`.
	- Login with user and password "admin".
	  (Let your browser remember these credentials.)
    - Open the "Apps" page.
	  - Note, that the following modules are already installed: "sales", 
	    "product_opencpq" and "product_opencpq_layout"
	- Activate variants by selecting
	  "Sales" > "Configuration" > "Settings" > "Products" > "Product Variants" >
	  "Products can have several attributes, ..."
	  and clicking "Apply".
  - Create an example product template and a variant:
	- Create a template via "Sales" > "Sales" > "Products" > "Create".
	  - Product Name: "Switch A"
	  - Activate "Enable the openCPQ Product Configurator".
	  - In the "General Information" page a field "Type of Configurator"
	    appears.  Enter "http://localhost:8080/".
	  - Save the form.
	- Create a variant via "Sales" > "Sales" > "Product Variants" > "Create".
	  - Activate "Use an openCPQ-template for this product".
	  - In the Product Template menu select "Switch A".
	  - A tab "Configuration" should have appeared.
	    Select it and click the "Configure" button to open the configurator.
	  - Create some configuration and pass it back to Odoo by clicking the "OK"
	    button.
	  - Save the form.

Create a snapshot of the virtual machine at this point.

Use (a copy of) this virtual machine for testing the openCPQ/Odoo integration.
After some testing you may return to the VM snapshot created above to revert any
changes you made to the code, the database, or any other state.


Updating the Code
-----------------

The code being tested comes from three Git repositories.
The working directories for these repositories are
`~/openCPQ-odoo`, `~/openCPQ-example-optical-transport`, and
`~/openCPQ-example-optical-transport/node_modules/opencpq`.

To update your installation, run `git pull` in the respective working
directories and invoke the required build steps:

- Updating the openCPQ/Odoo integration:
  - Execute in the terminal window:

    ```sh
    cd ~/openCPQ-odoo
    git pull
    cd
    ```
  - There is no build step, but:
    - Only if code outside the `static` directories has been changed:
      - In certain cases it is necessary to restart the Odoo server in its
	    terminal:
	    - Kill it with control-C.
		- Start it again with the command 

		  ```sh
		  cd odoo
		  ./odoo.py \
		    --database=odoo_test1 \
			--db-filter="^odoo" \
		    --addons-path=./addons,../openCPQ-odoo \
			-u product_opencpq,product_opencpq_layout
		  ### Note that we changed "-i" to "-u" 
		  ### This upgrades the specified modules instead of installing it
		  ```
      - If no python code has changed, it´s enough to update the two modules 
        in the "Apps" section of the Odoo UI (no server restart required).
    - If you are running Odoo in the browser, reload the page.
	  <br>
	  *If you are not in Odoo's debug mode, you might need
	  to restart Odoo and/or to clear your browser cache before reloading.*
- Updating openCPQ:
  - Execute in the terminal window:

    ```sh
    cd ~/openCPQ-example-optical-transport/node_modules/opencpq
    git pull
    npm install # Only needed if package.json has changed.
    npm run compile
    cd
    ```
  - Restart the configurator server as described below.
- Updating the optical-transport example:
  - In the terminal where the configurator code is served, stop the server with
    control-C.
	You should now be in directory `~/openCPQ-example-optical-transport`.
  - Execute in that terminal:

    ```sh
    git pull
    npm install # Only needed if package.json has changed.
    ```
  - Start the server for the configurator code again:

    ```sh
    npm run dev-server
    ```
  - If you have a configurator dialog opened in the Odoo UI, reload the
    configurator frame.
	<br>
	*You might need to clear your browser cache.*

You might want to revert your VM to the base-system snapshot before applying an
update and you might want to create another snapshot afterwards.


Miscellaneous
-------------

### Accessing the Servers From Outside the Virtual Machine

To access the Odoo server and the configurator server from outside the VM,
follow these steps:
- In the running VM's menu bar select
  "Devices" > "Network" > "Network Settings..."
  to open the "Network" page of the "Settings" dialog.
  - In tab "Adapter 1" click button "Port Forwarding" to open the
    "Port Forwarding Rules" editor.
    - Add two rules with arbitrary names, protocol "TCP", and empty host and
      guest IP:
      - one rule with host port and guest port set to 8080 (for the configurator)
      - one rule with host port and guest port set to 8069 (for Odoo)
	- Note: If you are on an untrusted network, you might want to restrict the
	  host IP.
- Inside the virtual machine, in the terminal running the configurator server:
  - Stop the server with control-C.
  - Start it again with

  	```sh
	./node_modules/.bin/webpack-dev-server --progress --watch --host 0.0.0.0
	```
    (Note that `npm run dev-server` runs the same command,
	except for the argument `--host 0.0.0.0`.)

Notes:
- You might want to apply this to the base-system snapshot and create another
  snapshot afterwards.
- If port 8069 of your host is already in use, you may use a different
  host port in the rule for Odoo.  Use the chosen port in your browser
  when accessing Odoo.
- If port 8080 of your host is already in use, you may use a different
  host and guest port in the port-forwarding rule for the configurator,
  e.g. 8888.
  (Use the same port for host and guest to make your configurator
  accessible under the same URL from both sides.)
  - You also have to adapt the configurator URLs in your
    configurable product templates:
    - Open the product-template list via "Sales" > "Sales" > "Products".
    - Select your product, possibly with the help of the search field.
      (The example product in the base-system snapshot is called "Switch A".)
    - Click the "Edit" button.
    - In tab "General Information" in field "Type of Configurator" adapt the
      port number in the configurator URL.
    - Save the form.
  - Add argument `--port 8888` when invoking
    `./node_modules/.bin/webpack-dev-server`.
