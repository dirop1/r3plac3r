var debug = true;
var templatesPath = 'templates/'

var r3 = function(target, template, loop) {
  if (target instanceof HTMLElement)
    this.elem = target;
  else if (target.charAt(0) == '#')
    this.elem = document.getElementById(target.substr(1));
  else if (target.charAt(0) == '.')
    this.elem = document.getElementsByClassName(target.substr(1))[0];
  else {
    log('No id passed to identify elements');
    return null;
  }
  this.r3template = function(temp) {
    this.elem.setAttribute("r3template", temp);
    r3updateElement(this.elem);
  };
  this.r3for = function(f) {
    this.elem.setAttribute("r3for", f);
    r3updateElement(this.elem);
  };
  //r3updateElement(elem);
  return self;
}

function r3updateElement(elem) {
  if (elem.getAttribute('r3template')) {
    r3t3mplate(elem);
  } else if (elem.getAttribute('r3for')) {
    r3f(elem);
  } else {
    log('why using r3 attr?');
  }
  return elem;
}

function r3fetch(URL, calback) {
  if (calback)
    return fetch(URL).then(res => {
      return res.text();
    }).then(data => {
      calback(data);
    });
  else
    return fetch(URL).then(res => {
      return res.text();
    }).then(data => {
      return data;
    });
}

function r3t3mplate(elem, tempname) {
  if (!tempname)
    tempname = elem.getAttribute('r3template');
  var fectched = fetch(templatesPath + tempname + '.html').then(res => {
    return res.text();
  }).then(data => {
    elem.innerHTML = data;
  });
  r3updateAll();
}

function r3updateAll() {
  //TODO https://stackoverflow.com/questions/33980250/css-selector-to-match-elements-by-attributes-name-start
  document.querySelectorAll('[r3template]').forEach(function(e) {
      if(! e.hasAttribute("r3done")){
        e.setAttribute("r3done", "done");
        r3t3mplate(e);
      }
    });
  document.querySelectorAll('[r3for]').forEach(function(e) {
    if(! e.hasAttribute("r3done")){
      e.setAttribute("r3done", "done");
      r3f(e);
    }
    });
}

function r3f(e, array) {
  var arr = (array) ? array : window[e.getAttribute("r3for")];
  if (!window[e.getAttribute("r3for")] && !array) {
    log('trying ulr');
    r3fetch(e.getAttribute("r3for"), function(data) {
      arr = JSON.parse(data);
      r3f(e, arr);
    });
    return;
  }
  var _in = '`' + e.innerHTML + '`';
  e.innerHTML = '';
  if (Array.isArray(arr)) {
    arr.forEach((item, index) => {
      e.innerHTML += eval(_in);
    });
  } else { //its an object (hopefully)
    item = arr;
    e.innerHTML += eval(_in);
  }
  r3updateAll();
}


document.addEventListener("DOMContentLoaded", function(event) {
  log("r3 starting DOMContentLoaded");
  r3updateAll();
});


function log(m) {
  if (debug) console.log(m);
}
