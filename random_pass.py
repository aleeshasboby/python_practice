import random
alpha=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
num=['1','2','3','4','5','6','7','8','9','0']
special_char=['!','@','#','$','%','^','&','*','(',')']
all_char=alpha+num+special_char
len=int(input("enter the length of the password: "))
password=""
print("your password is :")
for i  in range(len):
    password+=random.choice(all_char)
print(password)


