# Eris Hello World Contract

_A simple smart contract to deploy to a custom blockchain using [eris framework by Monax](https://monax.io/)._

This repo is a 101 tutorial for getting started with eris. I show you what to install and how to setup your very own chain. Afterwards we deploy a smart contract to the chain and we write a very simple node app for interacting with it.

The eris website already keeps good docs. So I try to keep this tutorial short on purpose because in most cases not all details are needed. I try to link to the appropriated pages in the case you need more information.

You need to have basic understand of blockchains like bitcoin or ethereum and smart contracts. Otherwise this tutorial will not help you because I won't explain here.

## Table of Contents

1. [Install Eris](#1-install-eris)
2. [Setup Chain](#2-setup-chain)
3. [Write Contract](#3-write-contract)
4. [Application](#4-application)

## 1. Install Eris

The eris frameworks provides a CLI tool. To use it you also need [Docker](https://www.docker.com/) (>= v1.9.1) and [Docker Machine](https://https//docs.docker.com/machine/) (>= v0.4.1).

### macOS

The easiest way on macOS is using [Homebrew](https://brew.sh/).

```sh
# Install eris and dependencies
brew cask install virtualbox
brew install eris docker docker-machine

# Create docker VM for eris
docker-machine create -d virtualbox eris

# Add this line to .bashrc
echo "eval $(docker-machine env eris)" > ~/.bashrc

# init eris
eris init
```

📝 [Eris Docs: Installing on macOS](https://monax.io/docs/tutorials/getting-started/#macos)

### Windows

If you're on windows I recommend to use [Chocolatey](https://chocolatey.org/).

```sh
# Install eris and dependencies
choco install eris docker docker-machine virtualbox

# IMPORTANT! If you do not use Docker Toolbox
# see docs for additional steps

# Finally, init eris
eris init
```

📝 [Eris Docs: Installing on Windows](https://monax.io/docs/tutorials/getting-started/#windows)

### Linux

You need to install [Docker](https://docs.docker.com/installation/) first.

#### Debian Package
For Ubuntu and Debian Linux

```sh
sudo add-apt-repository https://apt.monax.io
curl -L https://apt.monax.io/APT-GPG-KEY | sudo apt-key add -
sudo apt-get update && sudo apt-get install -y eris
```

#### RPM Package
For Fedora, CentOS, and RHEL

```sh
sudo su -c "curl -L https://yum.monax.io/yum/eris.repo > \
  /etc/yum.repos.d/eris.repo"
yum install -y eris-cli
```

📝 [Eris Docs: Installing on Linux](https://monax.io/docs/tutorials/getting-started/#linux)


### Test installation

To see if eris is installed simply check the `eris` command.

```sh
eris version
Eris CLI Version: 0.12.0
```

## 2. Setup Chain

### Prepare Docker

To get started you need to start the docker container.

```sh
# Create docker container if not happend already
docker-machine create -d virtualbox eris

# list all available machines
docker-machine ls                                                                                                 ~/Documents/University/TUB/11HTISE/eris-hello-world
NAME   ACTIVE   DRIVER       STATE   URL   SWARM   DOCKER    ERRORS
eris   -        virtualbox   Saved                 Unknown
```

You see with `docker-machine ls` I see all available machines. In this case I created already an eris machine. Let's start it.

```sh
docker-machine start eris
Starting "eris"...

docker-machine ls
NAME   ACTIVE   DRIVER       STATE     URL                         SWARM   DOCKER    ERRORS
eris   *        virtualbox   Running   tcp://192.168.99.100:2376           v1.12.3
```

Before we proceed make sure to set the env. This can also be added to your `.bashrc` to run everytime.

```sh
docker-machine env eris
```

### Keys

Before we create any chain let's create some keys for it.

```sh
# Start eris' keys service
eris services start keys

# Generate keys
eris keys gen
FBB4D91C8CC0C1E27D116ADF2DDB99F9F90DC551

# Export the new key
eris keys export FBB4D91C8CC0C1E27D116ADF2DDB99F9F90DC551

# See key data in dir
ls ~/.eris/keys/data
FBB4D91C8CC0C1E27D116ADF2DDB99F9F90DC551

# List all keys
eris keys ls
```


### Create Blockchain with Eris

Eris will create a folder in `~/.eris`. This directory holds all data for your chains, keys, contracts, etc.

```sh
eris chains make foo_chain
eris chains start foo_chain
```

Eris will not output a lot of information is very quiet by default. To see that your chain is created use `eris ls`. This command will list all services and chains.

```sh
eris ls
SERVICE       ON     CONTAINER ID     DATA CONTAINER
keys          *      0397ec6e0a       aa80e21b99

CHAIN         ON     CONTAINER ID     DATA CONTAINER
foo_chain     *      837996b5b3       7154bd5686
```

### Logs

You can find logs for your chain with the logs command

```sh
eris chains logs foo_chain
```

Now all is set. You created keys and a new chain. Good work!


## 3. Write Contract

Smart Contracts are written in Solidity. A sample contract can be found in `contracts/SeminarManager.sol` and `contracts/Seminar.sol`.

The file `epm.yaml` contains information about the contracts. This file is used during deployment so eris knows what to do. This is a simple one with only one action: deploy the contract.

More complex scenarios a possible. E.g. you could defines specific calls to the contract and even tests. The order of the defined jobs are handles in the sequence in which they are listed.

### Deploy the contract

In step 2, we already created a chain called `foo_chain`, which is stored under `~/.eris/chains/foo_chain`. To deploy a contract we need an address, which has the permission to deploy one.

The file `~/.eris/chains/foo_chain/addresses.csv` holds such an address.

```sh
addr=$(cat ~/.eris/chains/foo_chain/addresses.csv | grep foo_chain_full_000 | cut -d ',' -f 1)

echo $addr
AA45292750908DC73A7EB54BDE748327AD3167FF # Should look something like this.
```

Now we are ready:

```sh
cd contracts/
eris pkgs do -c foo_chain -a $addr
```

That's all. The contract is on the chain.

## 4. Application

Last but not least, a NodeJS app helps us to interact with the new contract. First off all we need to install the node dependencies.

```sh
npm install
```

*!!Manual Step!!* Secondly, you need to copy'n'paste two values into `js/libs/hello-chain.js`. The first value is the address you used beforehand while deploying the contract. The second is the path to the `accounts.json` file of your chain your using.

Now you can start the app.

```sh
node app.js
```

### Endpoints

While the app runs, the following REST Endpoints are available on `http://localhost:3080`

`GET /seminars`: List all seminars.

`GET /seminar/:id`: List one seminar.

`POST /seminars`: Body: `{"id": "234232", "buyer": "Mike", "seller": "Laura", "amount": 23984}`: Save new seminar.

