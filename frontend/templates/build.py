from glob import glob
from re import sub
from functools import reduce

files = glob('*.html')

def wrap(content,filename):
  content = sub('\n', ' ', content)
  content = sub('"', '\\"', content)
  content = 'cache["%s"] = "%s";'%(filename, content)
  return content

def read(el):
  with open(el) as fl:
    return fl.read()

def bundle():
  return '''
var cache = require('./ui').TEMPLATE_CACHE;
%s
  '''%reduce(lambda a,b: '%s\n%s'%(a,b), map(lambda filename: wrap(read(filename),filename), files))

if __name__ == '__main__':
  print(bundle())
