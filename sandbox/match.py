import db
import numpy
import time
import pprint

def get_matches(vector, num_matches):
	matches = []
	while True:
		vectors = db.get(20)
		matches.append(vectors[0])
		if len(matches) > num_matches:
			return matches
	return matches

def num_overlap(a, b):
	count = 0
	for t in a:
		if t in b:
			count +=1
	return count

def overlaps(test_vector, vectors):
	result = []
	for v in vectors:
		result.append(num_overlap(test_vector, v))
	return result

if __name__ == '__main__':
	test_vector = db.random_vector(20)
	t0 = time.time()
	matches = get_matches(test_vector, 10)
	t1 = time.time()
	o = overlaps(test_vector, matches)
	pp = pprint.PrettyPrinter(indent=4)
	print "Your vector:" 
	pp.pprint(test_vector)
	print "Matches"
	pp.pprint(matches) 
	print "Took: %f" % (t1 - t0)
	print "Average overlaps: %f" % numpy.mean(o)
	print "Stdev overlaps: %f" % numpy.std(o)

