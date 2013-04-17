import db
import numpy
import time
import pprint
import Queue
from Queue import PriorityQueue


def get_prob(matchQuant):
  return 2*numpy.sqrt(matchQuant)+matchQuant*(2*(1-numpy.sqrt(2)))  #cdf


def sim_coeff(vector1, vector2):
  x=1.0 * num_overlap(vector1, vector2)
  y=1.0*(len(vector1)+len(vector2))
  return get_prob(x/y)

def num_overlap(a, b):
  count = 0
  for t in a:
    if t in b:
      count +=1
  return count




def get_matches(vector, num_matches, search_size):
  best_matches = PriorityQueue(num_matches)
  good_matches = PriorityQueue(num_matches)
  ok_matches = PriorityQueue(num_matches)
  matches_found = 0
  vectors = db.get(search_size)

  for v in vectors:
    r = sim_coeff(vector, v)
    if r<.5:
      continue
    if r<.7:
      ok_matches.put((r, v))
      matches_found += 1
      if matches_found == num_matches:
        break
      else:
        continue
    if r<.9:
      good_matches.put((r, v))
      matches_found += 1
      if matches_found == num_matches:
        break
      else:
        continue
    if r<=1:
      best_matches.put((r, v))
      if not ok_matches.empty():
        ok_matches.get()
      else:
        matches_found += 1
      if matches_found == num_matches:
        break
      else:
        continue
    if r>1:
      print("Esthena is bad at math.")
      
  pq = PriorityQueue()
  while not best_matches.empty():
    pq.put(best_matches.get())
  while not good_matches.empty():
    pq.put(good_matches.get())
  while not (ok_matches.empty()):
    pq.put(ok_matches.get())
  matches = []
  while not pq.empty():
    matches.append(pq.get()[1])
  return matches



if __name__ == '__main__':
  matches_wanted = 5
  db_sample_size = 20
  test_vector = db.random_vector()
  matches = get_matches(test_vector, matches_wanted, db_sample_size)
  for v in matches:
    print(v)

      