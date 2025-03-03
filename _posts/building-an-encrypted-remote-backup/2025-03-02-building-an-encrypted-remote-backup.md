---
layout: post
title: Building an encrypted remote backup
description: Instructions for building a LUKS encrypted, off-site backup target
date: 2025-03-02
modified: 
categories: 
tags:
  - pi
  - encryption
  - LUKS
  - backup
  - gnome
  - armbian
  - debian
  - tailscale
---
# Why I built this
I've been keeping a portable hard drive (HDD) at someone else's house as an off-site, emergency backup. I had an [Orange Pi Zero 3](http://www.orangepi.org/html/hardWare/computerAndMicrocontrollers/details/Orange-Pi-Zero-3.html) handy and wanted to see if I could rig something up to access the drive remotely.

With this set up, I have a drive that:
- lives off-site,
- can be accessed remotely,
- decrypts itself on boot,
- and can be accessed over [Tailscale](https://tailscale.com/).

# Create the encrypted drive
In order to keep the content on the disk secure, the first thing you need is an HDD encrypted with LUKS. My favorite way to do that is to use the Gnome `disks` application to format the drive.

I used these settings for my drive:
- Volume Name: `zero3backup`
- Type: Internal disk for use with Linux systems only (Ext4)
	- Password protect volume (LUKS)

![gnome-disks-encrypt]({{site.url}}/assets/img/gnome-disks-encrypt.png)

# Install `cryptsetup`
On an [Orange Pi Zero 3](http://www.orangepi.org/html/hardWare/computerAndMicrocontrollers/details/Orange-Pi-Zero-3.html) running [armbian](https://www.armbian.com) (based on [debian](https://www.debian.org/) 12 at the time of writing), you can install `cryptsetup` with this command:

```bash
sudo apt install cryptsetup
```

`cryptsetup` is a command-line utility for managing disk encryption.
# Create and use a keyfile
In order to unlock the drive without entering the passphrase whenever the computer reboots, you can create a keyfile to unlock the encrypted partition. 

**Here's how to do that:**
## 1. Create a keyfile
To create a keyfile, you can use `dd` to generate a random file. This file will serve as the key that automatically unlocks the encrypted volume.

```bash
sudo dd if=/dev/random of=/root/my_keyfile bs=1024 count=4 sudo chmod 0400 /root/my_keyfile
```


- `/dev/random` is used to generate random data. 
- The `bs=1024 count=4` parameters define the size of the keyfile (in this case, 4 KB). 
- The `chmod 0400` command ensures that only root can read the keyfile, making it more secure. 

## 2. Add the keyfile to the LUKS partition
Next, you need to add the keyfile to the LUKS partition. Run the following command to add the keyfile to the LUKS header:

```bash
sudo cryptsetup luksAddKey /dev/sda1 /root/my_keyfile
```

You will be prompted to enter the current passphrase for the LUKS volume (the password you set during encryption). Once you enter it, the keyfile will be added to the partition, allowing it to be used for unlocking the drive.

## 3. Update `/etc/crypttab` to use the keyfile 
Now that the keyfile is created and associated with your LUKS partition, you need to modify `/etc/crypttab` to use the keyfile to unlock the encrypted volume automatically during boot. 

Edit `/etc/crypttab`:

```bash
sudo nano /etc/crypttab
```

Add the following entry:

```bash
zero3backup /dev/sda1 /root/my_keyfile luks # Replace "zero3backup" with your volume name
```

This tells the system to use the keyfile `/root/my_keyfile` to unlock `/dev/sda1` during boot.
## 4. Update the `initramfs`
Once you've edited `/etc/crypttab`, update the `initramfs` to apply the changes:

```bash
sudo update-initramfs -u
```

## 5. Configure `/etc/fstab`
If you want the decrypted partition (`/dev/mapper/zero3backup`) to automatically mount at boot, you'll need to add it to `/etc/fstab`. This step is necessary to  define  the mount point.

First, create the mount point:

```bash
sudo mkdir -p /mnt/zero3backup # Replace "/mnt/zero3backup" with whatever you want your mount point to be
```

Then, edit the `/etc/fstab` file:

```bash
sudo nano /etc/fstab
```

Add a line to mount the decrypted device:

```bash
/dev/mapper/zero3backup /mnt/zero3backup ext4 defaults 0 2
```
## 6. Reboot and test 
Now, when you reboot, the system will automatically unlock the drive using the keyfile and mount it if you've configured it in `/etc/fstab`.