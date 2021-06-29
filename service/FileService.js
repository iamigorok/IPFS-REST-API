"use strict";

/**
 * gets the file by its hash
 *
 *
 * hash String file hash
 * returns File
 **/
exports.getFileByHash = function(hash) {
  return new Promise(function(resolve, reject) {
    resolve(hash);
  });
};

exports.getFileByTitle = function(hash) {
  return new Promise(function(resolve, reject) {
    resolve(hash);
  });
};

exports.uploadFile = function(title, file) {
  return new Promise(function(resolve, reject) {
    resolve({ title: title, file: file });
  });
};

exports.updateFile = function(title, file) {
  return new Promise(function(resolve, reject) {
    resolve({ title: title, file: file });
  });
};

exports.getAllFiles = function(title, file) {
  return new Promise(function(resolve, reject) {
    resolve({ title: title, file: file });
  });
};

exports.deleteFile = function(title) {
  return new Promise(function(resolve, reject) {
    resolve({ title: title });
  });
};
