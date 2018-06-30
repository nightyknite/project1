z = 'ズン';d = 'ドコ';s = '';a = [];
setInterval(function () {
  if (a.join('') === z+z+z+z+d) {
    s = 'キ・ヨ・シ！';
    console.log(s);
    window.history.replaceState('', '',s);
    s = '';a = [];
  } else {
    a.shift();
    s = Math.random() < 0.5 ? z : d;
    a[4] = s;
    console.log(s);
    window.history.replaceState('', '',a.join(''));
  }
}, 500);
