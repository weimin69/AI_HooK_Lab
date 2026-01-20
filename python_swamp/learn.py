g = lambda x : x + 2
#n = int(input())
#print(g(n))

def ww(*p):
    return p[0] , p[3]
print(ww(1,2,3,4,5,6,7,8,9))

class Car:
    def infor(self):
        print("good car")
car = Car()
car.infor()

