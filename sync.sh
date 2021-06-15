#!/bin/bash

cp -rf $PWD ~/.local/share/gnome-shell/extensions/
busctl --user call org.gnome.Shell /org/gnome/Shell org.gnome.Shell Eval s 'Meta.restart("Restarting…")'
sleep 2
gnome-extensions disable whitetooth@kryptk.ml
gnome-extensions enable whitetooth@kryptk.ml