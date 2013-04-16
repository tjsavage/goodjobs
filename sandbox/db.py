import random
import time

CHOICES = "abcdefghi"

def get(n, length=None):
	result = []
	time.sleep(.02 + n * .001)
	for i in range(n):
		vector = []
		for j in range(random.randint(6,40)):
			vector.append("%s%s" % (random.choice(CHOICES), random.choice(CHOICES)))
		result.append(vector)
	return result

def random_vector(size):
	vector = []
	for j in range(random.randint(6,40)):
		vector.append("%s%s" % (random.choice(CHOICES), random.choice(CHOICES)))
	return vector
