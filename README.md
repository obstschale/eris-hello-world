# Eris Hello World Contract

_A simple smart contract to deploy to a custom blockchain using [eris framework by Monax](https://monax.io/)._

This repo is a 101 tutorial for getting started with eris. I show you what to install and how to setup your very own chain. Afterwards we deploy a smart contract to the chain and we write a very simple node app for interacting with it.

The eris website already keeps good docs. So I try to keep this tutorial short on purpose because in most cases not all details are needed. I try to link to the appropriated pages in the case you need more information.

## Table of Contents

1. [Install Eris](#1-install-eris)
2. [Setup Chain](#2-setup-chain)
3. [Write Contract](#3-write-contract)

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

## 2. Setup Chain

## 3. Write Contract
