import random


CHOICES = "abcdefghi"


def sim_coeff(vector1, vector2):
  x=1.0 * num_overlap(vector1, vector2)
  y=1.0*(len(vector1)+len(vector2))
  return (x/y)

def num_overlap(a, b):
  count = 0
  for t in a:
    if t in b:
      count +=1
  return count


def get(n):
  result = []
  for i in range(n):
    vector = []
    for j in range(random.randint(6,40)):
        x = "%s%s" % (random.choice(CHOICES), random.choice(CHOICES))
        while(x in vector):
          x = "%s%s" % (random.choice(CHOICES), random.choice(CHOICES))
        vector.append(x)
    result.append(vector)
  return result


def random_vector(length):
  vector = []
  for j in range(length):
    x = "%s%s" % (random.choice(CHOICES), random.choice(CHOICES))
    while(x in vector):
      x = "%s%s" % (random.choice(CHOICES), random.choice(CHOICES))
    vector.append(x)
  return vector


def sim(n):
  vec = random_vector(40)
  cpare = get(n)
  coeffs = []
  for v in cpare:
    r = sim_coeff(vec, v)
    coeffs.append(r)
  return coeffs

if __name__ == '__main__':
  vect = sim(500)
  for v in vect:
    print v