function copyArrAndManiPulate(arr,instructions){
  let newArr =[];
  for(let i=0;i<arr.length;i++){
    newArr.push(instructions(arr[i]));
  }
  return newArr;
}
const multiplyByTwo = (num) => num*2;
const addFive = (num) => num+5;

let newArr = [1,2,3,4,5,6,7,8,9,10,11];

let res = copyArrAndManiPulate(newArr,multiplyByTwo);
let res2 = copyArrAndManiPulate(newArr,addFive);
console.log(res)
console.log(res2)