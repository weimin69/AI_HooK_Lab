class person:
    def __init__(self, name , ages):
        self.name = name
        self.ages = ages
    def say_hi(self):
        print(f"good,i am {self.name}")
p = person('Alice',18)
print(p.name)

l = person('john',99)

print(l.ages)
#print(l.say_hi)
l.say_hi()


def maopaopaixu(arry):
    n = len(arry)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if arry[j] < arry[j+1]:
                arry[j] , arry[j + 1] = arry[j + 1] , arry[j]
    return arry

a = [ 0 , 8 ,4 ,5 ,6 ,33]

print(maopaopaixu(a))

#data =  [ list ( map(int , input().split())) for _ in range(n)]

def quick_sort(arr):
    if len(arr) < 2:
        return arr
    a = arr[0]
    right = [ x for x in arr[1:] if x > a]
    left = [ x for x in arr[1:] if x <= a]

    return quick_sort(left) + [a] + quick_sort(right)#用到递归


p = [ 9,2, 3 ,4 ,7, 88, 54]
print(quick_sort(p))


def choice_sort(arr):
    n = len(arr)
    for i in range(n-1):
        min = i
        for j in range(i+ 1,n):
            if arr[j] <  arr[min]:
                min = j
        arr[j] , arr[min] = arr[min] ,arr[j]

o = [2,4,66,333,3,1]

def quick_sort(arr):
    if  len(arr) < 2:
        return arr
    a = arr[0]

    right =  [ x for x in arr[:1] if x  >  a]
    left = [ x for x in arr[:1] if x <= a ]

    return quick_sort(left) +[a] + quick_sort(right)     









def jishu(arr):
    if not arr:
        return arr
    Max = max(arr)
    count = [0] * ( Max+ 1)
    for i in arr:
        count[i] += 1
    res = []
    for  i in range(len(arr)):
        res.extend([i] * count[i])
    return res

p = [ 0, 8 , 9, 7, 55]

#print(jishu(p))

import queue

p = queue.Queue()
p.put(0)

print(p.queue)
p.get(0)
print(p.queue)
kk = set()
kk.add(8)
print(kk)
print(sum(range(1,101)))

#n = int (input())

#data = [list(map(int , input().split())) for _ in range(n)]  
#print(data[0][0])


#def maopai(arr):
    #if len(arr) < 2:
        #return arr
    
def counting(arr):
    if  not arr:
        return arr
    mn ,mx = min(arr) , max(arr)
    count = [0] * (mx - mn + 1)
    for x in arr:
        count[x - mn] += 1
    res =  []
    for i ,c  in enumerate(count):
        if c > 0:
            res.extend([i + mn] * c)
    return res
o = [ 0 , 4, 4, 5, 2 ,3 ,55 ,66]

print(counting(o))

def quick_sort(arr):
    if  len(arr) < 2 :
        return arr
    a = arr[0]
    right = [ x for x in arr[1:] if x > a]
    left = [ x for x in arr[1:] if x <= a]

    return quick_sort(left) + [a] + quick_sort(right)