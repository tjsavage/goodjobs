import db
import numpy
import time
import pprint
import Queue
from Queue import PriorityQueue

"""
Edit this.
Inputs:
	vector: the vector of tags to find matches for
	num_matches: the minimum number of matches we're looking for
"""

def get_prob(matchQuant):
	return 4-(8*matchQuant)

"""def get_matches(vector, num_matches):
	vectors = db.get(6)
	for val in vectors:
		print val
	best_matches = PriorityQueue(num_matches)
	good_matches = PriorityQueue(num_matches)
	ok_matches = PriorityQueue(num_matches)
	matches_added = 0

	i = 0
	while matches_added<num_matches:
		r = sim_coeff(vector, vector[i])

		if r>.9:
			best_matches.put(vector[i], r)
			i += 1
			matches_added += 1
			if ok_matches.empty()==0:
				ok_matches.get()
			continue;
		

		elif .7<=r<=.9:
				good_matches.put(vector[i], r)
				i =+ 1
				matches_added += 1
				continue;
		else:
			ok_matches.put(vector[i], r)
			i =+ 1
			matches_added +=1
			continue;
"""

def get_matches(vector, num_matches):
	vs = db.get(6)
	ls = [1, 2, 3, 4, 5, 6]
	for index in ls:
		r = sim_coeff(vector, vs[index])
		print("Database: ")
		print vs[index]
		print("r")
		print r
		return


def sim_coeff(vector1, vector2):
	x=1.0 * num_overlap(vector1, vector2)
	y=1.0*(len(vector1)+len(vector2))
	print("overlaps: ")
	print x
	print ("total length: ")
	print y
	return (x/y)

def num_overlap(a, b):
	count = 0
	for t in a:
		if t in b:
			count +=1
	return count

#def overlaps(test_vector, vectors):
#	result = []
#	for v in vectors:
#		result.append(num_overlap(test_vector, v))
#	return result

if __name__ == '__main__':
	test_vector = db.random_vector(6)
	t0 = time.time()
	get_matches(test_vector, 3)
	#matches = get_matches(test_vector, 3)
	t1 = time.time()
	#o = overlaps(test_vector, matches)
	pp = pprint.PrettyPrinter(indent=4)
	print "Your vector:" 
	pp.pprint(test_vector)
#	print "Matches"
#	pp.pprint(matches) 
	print "Took: %f" % (t1 - t0)
	#print "Average overlaps: %f" % numpy.mean(o)
	#print "Stdev overlaps: %f" % numpy.std(o)

