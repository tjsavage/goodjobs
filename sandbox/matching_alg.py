import db
import numpy
import time
import pprint
import Queue
from Queue import PriorityQueue


def get_prob(matchQuant):
  return 2*numpy.sqrt(matchQuant)+matchQuant*(2*(1-numpy.sqrt(2)))


def sim_coeff(vector1, vector2):
  x=1.0 * num_overlap(vector1, vector2)
  y=1.0*(len(vector1)+len(vector2))
  print("overlaps: ")
  print x
  print ("total length: ")
  print y
  return get_prob(x/y)

def num_overlap(a, b):
  count = 0
  for t in a:
    if t in b:
      count +=1
  return count

def get_vectors():
  v1 = ['ei', 'da', 'eb', 'ad', 'ac', 'db', 'fb', 'gb', 'ai', 'di', 'ic', 'ib', 'gc', 'df', 'ca', 'if', 'bb', 'be', 'bg', 'bd', 'ie', 'ae', 'ag', 'ea', 'cf', 'hc', 'bh', 'ah', 'fc', 'ha', 'ia', 'ce']
  v2 = ['fi', 'id', 'cb', 'he', 'gg', 'bf', 'ae', 'be', 'ci', 'bc', 'gh', 'hg', 'ie', 'gf', 'fc', 'ef']
  v3 = ['eb', 'll']
  v4 = ['ed', 'di', 'ea', 'af', 'fh', 'bb', 'ag', 'eg', 'cd', 'ef', 'hc', 'fb', 'cf', 'db', 'ga', 'bh', 'ic', 'fi', 'ca', 'da', 'gi', 'gd', 'ce', 'df', 'aa', 'gg', 'bc']
  v5 = ['ba', 'gc', 'bi', 'be', 'fe', 'ef', 'ce', 'hb', 'he', 'ec', 'ai', 'dh', 'ie', 'ci', 'id', 'db', 'bb', 'ge', 'dd', 'cd', 'ed', 'ih', 'hh', 'di', 'ei', 'ag', 'eh']
  v6 = ['gb', 'ib', 'bg', 'ed', 'ah', 'ec', 'ai', 'if', 'hi', 'fh', 'bh', 'cf', 'cb', 'fc', 'gf', 'fg', 'ee']
  v7 = ['da', 'ac', 'bc', 'fb', 'af', 'be', 'hg', 'hc', 'gc', 'di']
  vectors = [v1, v2, v3, v4, v5, v6, v7]
  return vectors



def get_matches(vector, num_matches):
  best_matches = PriorityQueue(num_matches)
  good_matches = PriorityQueue(num_matches)
  ok_matches = PriorityQueue(num_matches)


  matches_found = 0
  vectors = get_vectors()
  for v in vectors:
    r = sim_coeff(vector, v)
    print(r)
    if r<.5:
      print("not a match")
      continue
    if r<.7:
      print("Ok Match Found")
      ok_matches.put((r, v))
      matches_found += 1
      print(v)
      if matches_found == num_matches:
        break
      else:
        continue
    if r<.9:
      print("Good Match Found")
      good_matches.put((r, v))
      matches_found += 1
      print(v)
      if matches_found == num_matches:
        break
      else:
        continue
    if r<=1:
      print("Great Match Found")
      best_matches.put((r, v))
      if not ok_matches.empty():
        ok_matches.get()
      else:
        matches_found += 1
      print(v)
      if matches_found == num_matches:
        break
      else:
        continue
    if r>1:
      print("Esthena is bad at math.")
      
  print("Ok: ")
  while not ok_matches.empty():
    print(ok_matches.get())
  print("Good: ")
  while not good_matches.empty():
    print(good_matches.get())
  print("Best: ")
  while not best_matches.empty():
    print(best_matches.get())

if __name__ == '__main__':
  test_vector = ['ee', 'ed', 'di', 'ea', 'af', 'fh', 'bb', 'ag', 'eg', 'cd', 'ef', 'hc', 'fb', 'cf', 'db', 'ga', 'bh', 'ic', 'fi', 'ca', 'da', 'gi', 'gd', 'ce', 'df', 'aa', 'gg', 'bc']
  matches = get_matches(test_vector, 4)
  #for v in matches:
  #  print(v)

      