import random
import time

CHOICES = "abcdefghi"

def get(n, length=None):
	result = []
	time.sleep(.02 + n * .001)
	for i in range(n):
		vector = []
		for j in range(random.randint(6,40)):
				x = "%s%s" % (random.choice(CHOICES), random.choice(CHOICES))
				while(x in vector):
					x = "%s%s" % (random.choice(CHOICES), random.choice(CHOICES))
				vector.append(x)
		result.append(vector)
	return result

def random_vector():
	vector = []
	for j in range(random.randint(6,40)):
		x = "%s%s" % (random.choice(CHOICES), random.choice(CHOICES))
		while(x in vector):
			x = "%s%s" % (random.choice(CHOICES), random.choice(CHOICES))
		vector.append(x)
	return vector
