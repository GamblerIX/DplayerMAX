# bvid说明

2020-03-23 B站推出了全新的稿件视频id`bvid`来接替之前的`avid`，其意义与之相同

详见：

1. [【升级公告】AV号全面升级至BV号（专栏）](https://www.bilibili.com/read/cv5167957)
2. [【升级公告】AV号全面升级至BV号](https://www.bilibili.com/blackboard/activity-BV-PC.html)

## 概述

### 格式

“bvid”恒为长度为 12 的字符串，前 3 个固定为“BV1”，后 9 个为 base58 计算结果（不包含数字 `0` 和大写字母 `I`、 `O` 以及小写字母 `l`）

### 实质

“bvid"为“avid”的base58编码，可通过算法进行相互转化

### avid发号方式的变化

从 2009-09-09 09:09:09 [av2](https://www.bilibili.com/video/av2) 的发布到 2020-03-28 19:45:02 [av99999999](https://www.bilibili.com/video/av99999999) 的发布B站结束了以投稿时间为顺序的avid发放，改为随机发放avid



## 算法概述

实际上上面的算法依然不完整，新的算法参考自 [SocialSisterYi#740](https://github.com/SocialSisterYi/bilibili-API-collect/issues/740)

### av->bv算法

**说明**

1. 目前的 BV 格式为 BV1XXXXXXXXX，以 BV1 开头，后面包含 9 位有效数据。
2. AV 最大值为 2⁵¹。

**算法**

- 定义一个包含初始值为 `['B', 'V', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0']` 的长度为 12 的数组`bytes`，用于存储转换后的字符。
  - 定义变量 `bv_idx` 并初始化为数组 `bytes` 的最后一个索引。
  - 将输入的 `aid` 与 avid 最大值（2⁵¹）进行按位或运算，其结果与常量 `XOR_CODE`（23442827791579）进行异或运算，得到变量 `tmp`。
  - 当 `tmp` 大于0时，循环执行以下操作直到小于0：
    - 将 `tmp` 除以 58（码表的长度） 的余数作为索引，从 `FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf` 码表中取出对应的字符，并将其赋值给 `bytes[bv_idx]`。
    - 将 `tmp` 与 58 求模赋值给 `tmp`。
    - 将 `bv_idx` 减1。
  - 将 `bytes` 数组中索引为 3 和 9 的元素进行交换。
  - 将 `bytes` 数组中索引为 4 和 7 的元素进行交换。
  - 将 `bytes` 数组转换为字符串，并返回结果。

### bv->av算法

是 #av->bv算法 的逆向

- 将 `bvid` 中索引为 3 和 9 的字符进行交换。
- 将 `bvid` 中索引为 4 和 7 的字符进行交换。
- 删除 `bvid` 前3个字符（固定为 BV1）。
- 定义变量 `tmp` 并初始化为 0。
- 遍历 `bvid` 的每个字符，执行以下操作：
  - 获取当前字符在 `FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf` 码表中的索引，并将其赋值给变量 `idx`。
  - 将 `tmp` 乘以常量 58，并加上 `idx`，最后赋值给 `tmp`。
- 将 `tmp` 与常量 2⁵¹ - 1 进行按位与运算，其结果与常量 `XOR_CODE`（23442827791579） 进行异或运算，得到最终结果。

## 编程实现

### JavaScript/TypeScript

<CodeGroup>
  <CodeGroupItem title="JavaScript">

```javascript
const XOR_CODE = 23442827791579n;
const MASK_CODE = 2251799813685247n;
const MAX_AID = 1n << 51n;
const BASE = 58n;

const data = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf';

function av2bv(aid) {
  const bytes = ['B', 'V', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0'];
  let bvIndex = bytes.length - 1;
  let tmp = (MAX_AID | BigInt(aid)) ^ XOR_CODE;
  while (tmp > 0) {
    bytes[bvIndex] = data[Number(tmp % BigInt(BASE))];
    tmp = tmp / BASE;
    bvIndex -= 1;
  }
  [bytes[3], bytes[9]] = [bytes[9], bytes[3]];
  [bytes[4], bytes[7]] = [bytes[7], bytes[4]];
  return bytes.join('');
}

function bv2av(bvid) {
  const bvidArr = Array.from(bvid);
  [bvidArr[3], bvidArr[9]] = [bvidArr[9], bvidArr[3]];
  [bvidArr[4], bvidArr[7]] = [bvidArr[7], bvidArr[4]];
  bvidArr.splice(0, 3);
  const tmp = bvidArr.reduce((pre, bvidChar) => pre * BASE + BigInt(data.indexOf(bvidChar)), 0n);
  return Number((tmp & MASK_CODE) ^ XOR_CODE);
}

console.log(av2bv(111298867365120));
console.log(bv2av('BV1L9Uoa9EUx'));
```

  </CodeGroupItem>

  <CodeGroupItem title="TypeScript">

```typescript
const XOR_CODE = 23442827791579n;
const MASK_CODE = 2251799813685247n;
const MAX_AID = 1n << 51n;
const BASE = 58n;

const data = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf';

function av2bv(aid: number) {
  const bytes = ['B', 'V', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0'];
  let bvIndex = bytes.length - 1;
  let tmp = (MAX_AID | BigInt(aid)) ^ XOR_CODE;
  while (tmp > 0) {
    bytes[bvIndex] = data[Number(tmp % BigInt(BASE))];
    tmp = tmp / BASE;
    bvIndex -= 1;
  }
  [bytes[3], bytes[9]] = [bytes[9], bytes[3]];
  [bytes[4], bytes[7]] = [bytes[7], bytes[4]];
  return bytes.join('') as `BV1${string}`;
}

function bv2av(bvid: `BV1${string}`) {
  const bvidArr = Array.from<string>(bvid);
  [bvidArr[3], bvidArr[9]] = [bvidArr[9], bvidArr[3]];
  [bvidArr[4], bvidArr[7]] = [bvidArr[7], bvidArr[4]];
  bvidArr.splice(0, 3);
  const tmp = bvidArr.reduce((pre, bvidChar) => pre * BASE + BigInt(data.indexOf(bvidChar)), 0n);
  return Number((tmp & MASK_CODE) ^ XOR_CODE);
}

console.log(av2bv(111298867365120));
console.log(bv2av('BV1L9Uoa9EUx'));
```
  </CodeGroupItem>
</CodeGroup>

### Python

来自：[#847](https://github.com/SocialSisterYi/bilibili-API-collect/issues/847#issuecomment-1807020675)

```python
XOR_CODE = 23442827791579
MASK_CODE = 2251799813685247
MAX_AID = 1 << 51
ALPHABET = "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf"
ENCODE_MAP = 8, 7, 0, 5, 1, 3, 2, 4, 6
DECODE_MAP = tuple(reversed(ENCODE_MAP))

BASE = len(ALPHABET)
PREFIX = "BV1"
PREFIX_LEN = len(PREFIX)
CODE_LEN = len(ENCODE_MAP)

def av2bv(aid: int) -> str:
    bvid = [""] * 9
    tmp = (MAX_AID | aid) ^ XOR_CODE
    for i in range(CODE_LEN):
        bvid[ENCODE_MAP[i]] = ALPHABET[tmp % BASE]
        tmp //= BASE
    return PREFIX + "".join(bvid)

def bv2av(bvid: str) -> int:
    assert bvid[:3] == PREFIX

    bvid = bvid[3:]
    tmp = 0
    for i in range(CODE_LEN):
        idx = ALPHABET.index(bvid[DECODE_MAP[i]])
        tmp = tmp * BASE + idx
    return (tmp & MASK_CODE) ^ XOR_CODE

assert av2bv(111298867365120) == "BV1L9Uoa9EUx"
assert bv2av("BV1L9Uoa9EUx") == 111298867365120
```

### Rust

参考 <https://github.com/Colerar/abv/blob/main/src/lib.rs>

### Swift

```swift
fileprivate let XOR_CODE: UInt64 = 23442827791579
fileprivate let MASK_CODE: UInt64 = 2251799813685247
fileprivate let MAX_AID: UInt64 = 1 << 51

fileprivate let data: [UInt8] = [70, 99, 119, 65, 80, 78, 75, 84, 77, 117, 103, 51, 71, 86, 53, 76, 106, 55, 69, 74, 110, 72, 112, 87, 115, 120, 52, 116, 98, 56, 104, 97, 89, 101, 118, 105, 113, 66, 122, 54, 114, 107, 67, 121, 49, 50, 109, 85, 83, 68, 81, 88, 57, 82, 100, 111, 90, 102]

fileprivate let BASE: UInt64 = 58
fileprivate let BV_LEN: Int = 12
fileprivate let PREFIX: String = "BV1"

func av2bv(avid: UInt64) -> String {
    var bytes: [UInt8] = [66, 86, 49, 48, 48, 48, 48, 48, 48, 48, 48, 48]
    var bvIdx = BV_LEN - 1
    var tmp = (MAX_AID | avid) ^ XOR_CODE

    while tmp != 0 {
        bytes[bvIdx] = data[Int(tmp % BASE)]
        tmp /= BASE
        bvIdx -= 1
    }

    bytes.swapAt(3, 9)
    bytes.swapAt(4, 7)

    return String(decoding: bytes, as: UTF8.self)
}

func bv2av(bvid: String) -> UInt64 {
    let fixedBvid: String
    if bvid.hasPrefix("BV") {
        fixedBvid = bvid
    } else {
        fixedBvid = "BV" + bvid
    }
    var bvidArray = Array(fixedBvid.utf8)

    bvidArray.swapAt(3, 9)
    bvidArray.swapAt(4, 7)

    let trimmedBvid = String(decoding: bvidArray[3...], as: UTF8.self)

    var tmp: UInt64 = 0

    for char in trimmedBvid {
        if let idx = data.firstIndex(of: char.utf8.first!) {
            tmp = tmp * BASE + UInt64(idx)
        }
    }

    return (tmp & MASK_CODE) ^ XOR_CODE
}

print(av2bv(avid: 111298867365120))
print(bv2av(bvid: "BV1L9Uoa9EUx"))
```

### Java

```java
import java.math.BigInteger;

/**
 * @author cctyl
 */
public class AVBVConverter {

    private static final BigInteger XOR_CODE = BigInteger.valueOf(23442827791579L);
    private static final BigInteger MASK_CODE = BigInteger.valueOf(2251799813685247L);
    private static final BigInteger MAX_AID = BigInteger.ONE.shiftLeft(51);
    private static final int BASE = 58;

    private static final String DATA = "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf";

    public static String av2bv(long aidParam) {
        BigInteger aid = BigInteger.valueOf(aidParam);
        char[] bytes = {'B', 'V', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0'};
        int bvIndex = bytes.length - 1;
        BigInteger tmp = MAX_AID.or(aid).xor(XOR_CODE);
        while (tmp.compareTo(BigInteger.ZERO) > 0) {
            bytes[bvIndex] = DATA.charAt(tmp.mod(BigInteger.valueOf(BASE)).intValue());
            tmp = tmp.divide(BigInteger.valueOf(BASE));
            bvIndex--;
        }
        swap(bytes, 3, 9);
        swap(bytes, 4, 7);
        return new String(bytes);
    }

    public static long bv2av(String bvid) {
        char[] bvidArr = bvid.toCharArray();
        swap(bvidArr, 3, 9);
        swap(bvidArr, 4, 7);
        String adjustedBvid = new String(bvidArr, 3, bvidArr.length - 3);
        BigInteger tmp = BigInteger.ZERO;
        for (char c : adjustedBvid.toCharArray()) {
            tmp = tmp.multiply(BigInteger.valueOf(BASE)).add(BigInteger.valueOf(DATA.indexOf(c)));
        }
        BigInteger xor = tmp.and(MASK_CODE).xor(XOR_CODE);
        return xor.longValue();
    }


    private static void swap(char[] array, int i, int j) {
        char temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    public static void main(String[] args) {

        final int aid1 = 643755790;
        final String bv1 = "BV1bY4y1j7RA";

        final int aid2 = 305988942;
        final String bv2 = "BV1aP411K7it";

        //av ==> bv
        assert av2bv(aid1).equals(bv1);
        assert av2bv(aid2).equals(bv2);

        //bv ==>av
        assert bv2av(bv1) == aid1;
        assert bv2av(bv2) == aid2;
    }
}
```

### Golang

```go
package main

import (
	"fmt"
	"strings"
)

var (
	XOR_CODE = int64(23442827791579)
	MAX_CODE = int64(2251799813685247)
	CHARTS   = "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf"
	PAUL_NUM = int64(58)
)

func swapString(s string, x, y int) string {
	chars := []rune(s)
	chars[x], chars[y] = chars[y], chars[x]
	return string(chars)
}

func Bvid2Avid(bvid string) (avid int64) {
	s := swapString(swapString(bvid, 3, 9), 4, 7)
	bv1 := string([]rune(s)[3:])
	temp := int64(0)
	for _, c := range bv1 {
		idx := strings.IndexRune(CHARTS, c)
		temp = temp*PAUL_NUM + int64(idx)
	}
	avid = (temp & MAX_CODE) ^ XOR_CODE
	return
}

func Avid2Bvid(avid int64) (bvid string) {
	arr := [12]string{"B", "V", "1"}
	bvIdx := len(arr) - 1
	temp := (avid | (MAX_CODE + 1)) ^ XOR_CODE
	for temp > 0 {
		idx := temp % PAUL_NUM
		arr[bvIdx] = string(CHARTS[idx])
		temp /= PAUL_NUM
		bvIdx--
	}
	raw := strings.Join(arr[:], "")
	bvid = swapString(swapString(raw, 3, 9), 4, 7)
	return
}

func main() {
	avid := int64(1054803170)
	bvid := "BV1mH4y1u7UA"
	resAvid := Bvid2Avid(bvid)
	resBvid := Avid2Bvid(avid)

	fmt.Printf("convert bvid to avid: %v\tvalue:%v\n", avid == resAvid, resAvid)
	fmt.Printf("convert avid to bvid: %v\tvalue:%v\n", bvid == resBvid, resBvid)

}

```


### C++
```cpp
#include <algorithm>
#include <cassert>
#include <print>
#include <string>

constexpr int64_t XOR_CODE          = 0x1552356C4CDB;
constexpr int64_t MAX_AID           = 0x8000000000000;
constexpr int64_t MASK_CODE         = MAX_AID - 1;
constexpr int64_t BASE              = 58;
constexpr char    Table[BASE + 1]   = "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf";
constexpr char    ReverseTable[128] = {
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x2c, 0x2d, 0x0b, 0x1a, 0x0e, 0x27, 0x11, 0x1d, 0x34, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x03, 0x25, 0x2a, 0x31, 0x12, 0x00, 0x0c, 0x15, 0x00, 0x13, 0x06, 0x0f, 0x08, 0x05, 0x00,
    0x04, 0x32, 0x35, 0x30, 0x07, 0x2f, 0x0d, 0x17, 0x33, 0x20, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x1f, 0x1c, 0x01, 0x36, 0x21, 0x39, 0x0a, 0x1e, 0x23, 0x10, 0x29, 0x00, 0x2e, 0x14, 0x37,
    0x16, 0x24, 0x28, 0x18, 0x1b, 0x09, 0x22, 0x02, 0x19, 0x2b, 0x26, 0x00, 0x00, 0x00, 0x00, 0x00
};

std::string Av2bv(const int64_t Avid) {
    assert(Avid > 0 && "Avid must be greater than 0");
    std::string bv = "BV1";
    bv.resize(12, '\0');

    int64_t tmp = (Avid | MAX_AID) ^ XOR_CODE;
    for (size_t i = bv.size() - 1; tmp > 0 && i > 2; --i) {
        bv[i] = Table[tmp % BASE];
        tmp /= BASE;
    }
    std::ranges::swap(bv.at(3), bv.at(9));
    std::ranges::swap(bv.at(4), bv.at(7));
    return bv;
}

int64_t Bv2av(const std::string &Bvid) {
    assert(Bvid.starts_with("BV1") && "Bvid must start with 'BV1'");

    auto Bvid_ = Bvid;
    std::ranges::swap(Bvid_.at(3), Bvid_.at(9));
    std::ranges::swap(Bvid_.at(4), Bvid_.at(7));

    int64_t tmp = 0;
    for (int i = 3; i < Bvid_.size(); ++i) {
        tmp = ReverseTable[Bvid_.at(i)] + BASE * tmp;
    }
    return (tmp & MASK_CODE) ^ XOR_CODE;
}

int main() {
    assert(Av2bv(1004871019) == "BV16x4y1H7M1");
    assert(Bv2av("BV16x4y1H7M1") == 1004871019);
}
```



## 老版算法存档

**以下算法已失效**，编解码函数值域有限，不推荐使用，在此仅作为存档

<details>
<summary>查看折叠内容：</summary>

算法参考自[【揭秘】av号转bv号的过程](https://www.bilibili.com/video/BV1N741127Tj)

### av->bv算法

注：本算法及示例程序仅能编解码`avid < 29460791296`，且暂无法验证`avid >= 29460791296`的正确性
再注：本人不清楚新算法能否编解码`avid >= 29460791296`

1. a = (avid ⊕ 177451812) + 100618342136696320
2. 以 i 为循环变量循环 6 次 b[i] = (a / 58 ^ i) % 58
3. 将 b[i] 中各个数字转换为以下码表中的字符

码表：

> fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF

4. 初始化字符串 b[i]=` `

5. 按照以下字符顺序编码表编码并填充至 b[i]

字符顺序编码表：

> 0 -> 9
>
> 1 -> 8
>
> 2 -> 1
>
> 3 -> 6
>
> 4 -> 2
>
> 5 -> 4
>
> 6 -> 0
>
> 7 -> 7
>
> 8 -> 3
>
> 9 -> 5

### bv->av算法

为以上算法的逆运算

### 编程实现

使用 Python C TypeScript Java Kotlin Golang Rust 等语言作为示例，欢迎社区提交更多例程

#### Python

```python
XOR = 177451812
ADD = 100618342136696320
TABLE = "fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF"
MAP = 9, 8, 1, 6, 2, 4, 0, 7, 3, 5


def av2bv(av: int) -> str:
    av = (av ^ XOR) + ADD
    bv = [""] * 10
    for i in range(10):
        bv[MAP[i]] = TABLE[(av // 58**i) % 58]
    return "".join(bv)


def bv2av(bv: int) -> int:
    av = [""] * 10
    s = 0
    for i in range(10):
        s += TABLE.find(bv[MAP[i]]) * 58**i
    av = (s - ADD) ^ XOR

    return av


def main():
    while 1:
        mode = input("1. AV to BV\n2. BV to AV\n3. Exit\n你的选择：")
        if mode == "1":
            print(f"BV号是：BV {av2bv(int(input('AV号是：')))}")
        elif mode == "2":
            print(f"AV号是：AV {bv2av(input('BV号是：'))}")
        elif mode == "3":
            break
        else:
            print("输入错误请重新输入")


if __name__ == "__main__":
    main()
```

#### C

```c
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>

const char table[] = "fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF"; // 码表
char tr[124]; // 反查码表
const unsigned long long XOR = 177451812; // 固定异或值
const unsigned long long ADD = 8728348608; // 固定加法值
const int s[] = {11, 10, 3, 8, 4, 6}; // 位置编码表

// 初始化反查码表
void tr_init() {
	for (int i = 0; i < 58; i++)
		tr[table[i]] = i;
}

unsigned long long bv2av(char bv[]) {
	unsigned long long r = 0;
	unsigned long long av;
	for (int i = 0; i < 6; i++)
		r += tr[bv[s[i]]] * (unsigned long long)pow(58, i);
	av = (r - ADD) ^ XOR;
	return av;
}

char *av2bv(unsigned long long av) {
	char *result = (char*)malloc(13);
	strcpy(result,"BV1  4 1 7  ");
	av = (av ^ XOR) + ADD;
	for (int i = 0; i < 6; i++)
		result[s[i]] = table[(unsigned long long)(av / (unsigned long long)pow(58, i)) % 58];
	return result;
}

int main() {
	tr_init();
	printf("%s\n", av2bv(170001));
	printf("%u\n", bv2av("BV17x411w7KC"));
	return 0;
}
```

输出为：

```
BV17x411w7KC
170001
```

#### TypeScript

感谢[#417](https://github.com/SocialSisterYi/bilibili-API-collect/issues/417#issuecomment-1186475063)提供

```typescript
export default class BvCode {
  private TABEL = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF'; // 码表
  private TR: Record<string, number> = {}; // 反查码表
  private S = [11, 10, 3, 8, 4, 6]; // 位置编码表
  private XOR = 177451812; // 固定异或值
  private ADD = 8728348608; // 固定加法值
  constructor() {
    // 初始化反查码表
    const len = this.TABEL.length;
    for (let i = 0; i < len; i++) {
      this.TR[this.TABEL[i]] = i;
    }
  }
  av2bv(av: number): string {
    const x_ = (av ^ this.XOR) + this.ADD;
    const r = ['B', 'V', '1', , , '4', , '1', , '7'];
    for (let i = 0; i < 6; i++) {
      r[this.S[i]] = this.TABEL[Math.floor(x_ / 58 ** i) % 58];
    }
    return r.join('');
  }
  bv2av(bv: string): number {
    let r = 0;
    for (let i = 0; i < 6; i++) {
      r += this.TR[bv[this.S[i]]] * 58 ** i;
    }
    return (r - this.ADD) ^ this.XOR;
  }
}

const bvcode = new BvCode();

console.log(bvcode.av2bv(170001));
console.log(bvcode.bv2av('BV17x411w7KC'));
```

输出为：

```
BV17x411w7KC
170001
```

#### Java

```java
/**
 * 算法来自：https://www.zhihu.com/question/381784377/answer/1099438784
 */
public class Util {
    private static final String TABLE = "fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF";
    private static final int[] S = new int[]{11, 10, 3, 8, 4, 6};
    private static final int XOR = 177451812;
    private static final long ADD = 8728348608L;
    private static final Map<Character, Integer> MAP = new HashMap<>();

    static {
        for (int i = 0; i < 58; i++) {
            MAP.put(TABLE.charAt(i), i);
        }
    }

    public static String aidToBvid(int aid) {
        long x = (aid ^ XOR) + ADD;
        char[] chars = new char[]{'B', 'V', '1', ' ', ' ', '4', ' ', '1', ' ', '7', ' ', ' '};
        for (int i = 0; i < 6; i++) {
            int pow = (int) Math.pow(58, i);
            long i1 = x / pow;
            int index = (int) (i1 % 58);
            chars[S[i]] = TABLE.charAt(index);
        }
        return String.valueOf(chars);
    }

    public static int bvidToAid(String bvid) {
        long r = 0;
        for (int i = 0; i < 6; i++) {
            r += MAP.get(bvid.charAt(S[i])) * Math.pow(58, i);
        }
        return (int) ((r - ADD) ^ XOR);
    }
}
```

#### Kotlin

```kotlin
/**
 * 此程序非完全原创，改编自GH站内某大佬的Java程序，修改了部分代码，且转换为Kotlin
 * 算法来源同上
 */
object VideoUtils {
    //这里是由知乎大佬不知道用什么方法得出的转换用数字
    var ss = intArrayOf(11, 10, 3, 8, 4, 6, 2, 9, 5, 7)
    var xor: Long = 177451812 //二进制时加减数1

    var add = 8728348608L //十进制时加减数2

    //变量初始化工作，加载哈希表
    private const val table = "fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF"
    private val mp = HashMap<String, Int>()
    private val mp2 = HashMap<Int, String>()

    //现在，定义av号和bv号互转的方法
//定义一个power乘方方法，这是转换进制必要的
    fun power(a: Int, b: Int): Long {
        var power: Long = 1
        for (c in 0 until b) power *= a.toLong()
        return power
    }

    //bv转av方法
    fun bv2av(s: String): String {
        var r: Long = 0
        //58进制转换
        for (i in 0..57) {
            val s1 = table.substring(i, i + 1)
            mp[s1] = i
        }
        for (i in 0..5) {
            r += mp[s.substring(ss[i], ss[i] + 1)]!! * power(58, i)
        }
        //转换完成后，需要处理，带上两个随机数
        return (r - add xor xor).toString()
    }

    //av转bv方法
    fun av2bv(st: String): String {
        try {
            var s = java.lang.Long.valueOf(st.split("av".toRegex()).dropLastWhile { it.isEmpty() }
                .toTypedArray()[1])
            val sb = StringBuffer("BV1  4 1 7  ")
            //逆向思路，先将随机数还原
            s = (s xor xor) + add
            //58进制转回
            for (i in 0..57) {
                val s1 = table.substring(i, i + 1)
                mp2[i] = s1
            }
            for (i in 0..5) {
                val r = mp2[(s / power(58, i) % 58).toInt()]
                sb.replace(ss[i], ss[i] + 1, r!!)
            }
            return sb.toString()
        } catch (e: ArrayIndexOutOfBoundsException) {
            return ""
        }
    }

}
```

#### Golang

```go
package main

import "math"

const TABLE = "fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF"
var S = [11]uint{11, 10, 3, 8, 4, 6}
const XOR = 177451812
const ADD = 8728348608

var TR = map[string]int64{}

// 初始化 TR
func init() {
	for i := 0; i < 58; i++ {
		TR[TABLE[i:i+1]] = int64(i)
	}
}

func BV2AV(bv string) int64 {
	r := int64(0)
	for i := 0; i < 6; i++ {
		r += TR[bv[S[i]:S[i]+1]] * int64(math.Pow(58, float64(i)))
	}
	return (r - ADD) ^ XOR
}

func AV2BV(av int64) string {
	x := (av ^ XOR) + ADD
	r := []rune("BV1  4 1 7  ")
	for i := 0; i < 6; i++ {
		r[S[i]] = rune(TABLE[x/int64(math.Pow(58, float64(i)))%58])
	}
	return string(r)
}

func main() {
	println(AV2BV(170001))
	println(BV2AV("BV17x411w7KC"))
}
```

输出为：

```
BV17x411w7KC
170001
```

#### Rust

crate: https://github.com/stackinspector/bvid

```rust
// Copyright (c) 2023 stackinspector. MIT license.

const XORN: u64 = 177451812;
const ADDN: u64 = 100618342136696320;
const TABLE: [u8; 58] = *b"fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF";
const MAP: [usize; 10] = [9, 8, 1, 6, 2, 4, 0, 7, 3, 5];
const REV_TABLE: [u8; 74] = [
    13, 12, 46, 31, 43, 18, 40, 28,  5,  0,  0,  0,  0,  0,  0,  0, 54, 20, 15, 8,
    39, 57, 45, 36,  0, 38, 51, 42, 49, 52,  0, 53,  7,  4,  9, 50, 10, 44, 34, 6,
    25,  1,  0,  0,  0,  0,  0,  0, 26, 29, 56,  3, 24,  0, 47, 27, 22, 41, 16, 0,
    11, 37,  2, 35, 21, 17, 33, 30, 48, 23, 55, 32, 14, 19,
];
const POW58: [u64; 10] = [
    1, 58, 3364, 195112, 11316496, 656356768, 38068692544,
    2207984167552, 128063081718016, 7427658739644928,
];

fn av2bv(avid: u64) -> [u8; 10] {
    let a = (avid ^ XORN) + ADDN;
    let mut bvid = [0; 10];
    for i in 0..10 {
        bvid[MAP[i]] = TABLE[(a / POW58[i]) as usize % 58];
    }
    bvid
}

fn bv2av(bvid: [u8; 10]) -> u64 {
    let mut a = 0;
    for i in 0..10 {
        a += REV_TABLE[bvid[MAP[i]] as usize - 49] as u64 * POW58[i];
    }
    (a - ADDN) ^ XORN
}

// assert_eq!(*b"17x411w7KC", av2bv(170001));
// assert_eq!(170001, bv2av(*b"17x411w7KC"));
```

</details>


# misc/sign/wbi.md

# WBI 签名

自 2023 年 3 月起，Bilibili Web 端部分接口开始采用 WBI 签名鉴权，表现在 REST API 请求时在 Query param 中添加了 `w_rid` 和 `wts` 字段。WBI 签名鉴权独立于 [APP 鉴权](APP.md) 与其他 Cookie 鉴权，目前被认为是一种 Web 端风控手段。

经持续观察，大部分查询性接口都已经或准备采用 WBI 签名鉴权，请求 WBI 签名鉴权接口时，若签名参数 `w_rid` 与时间戳 `wts` 缺失、错误，会返回 [`v_voucher`](v_voucher.md)，如：

```json
{"code":0,"message":"0","ttl":1,"data":{"v_voucher":"voucher_******"}}
```

感谢 [#631](https://github.com/SocialSisterYi/bilibili-API-collect/issues/631) 的研究与逆向工程。

细节更新：[#885](https://github.com/SocialSisterYi/bilibili-API-collect/issues/885)。

最新进展: [#919](https://github.com/SocialSisterYi/bilibili-API-collect/issues/919)

## WBI 签名算法

1. 获取实时口令 `img_key`、`sub_key`

   从 [nav 接口](../../login/login_info.md#导航栏用户信息) 中获取 `img_url`、`sub_url` 两个字段的参数。
   或从 [bili_ticket 接口](bili_ticket.md#接口) 中获取 `img` `sub` 两个字段的参数。

   **注：`img_url`、`sub_url` 两个字段的值看似为存于 BFS 中的 png 图片 url，实则只是经过伪装的实时 Token，故无需且不能试图访问这两个 url**

   ```json
   {"code":-101,"message":"账号未登录","ttl":1,"data":{"isLogin":false,"wbi_img":{"img_url":"https://i0.hdslb.com/bfs/wbi/7cd084941338484aae1ad9425b84077c.png","sub_url":"https://i0.hdslb.com/bfs/wbi/4932caff0ff746eab6f01bf08b70ac45.png"}}}
   ```

   截取其文件名，分别记为 `img_key`、`sub_key`，如上述例子中的 `7cd084941338484aae1ad9425b84077c` 和 `4932caff0ff746eab6f01bf08b70ac45`。

   `img_key`、`sub_key` 全站统一使用，观测知应为**每日更替**，使用时建议做好**缓存和刷新**处理。

   特别地，发现部分接口将 `img_key`、`sub_key` 硬编码进 JavaScript 文件内，如搜索接口 `https://s1.hdslb.com/bfs/static/laputa-search/client/assets/index.1ea39bea.js`，暂不清楚原因及影响。
   同时, 部分页面会在 SSR 的 `__INITIAL_STATE__` 包含 `wbiImgKey` 与 `wbiSubKey`, 具体可用性与区别尚不明确

2. 打乱重排实时口令获得 `mixin_key`

   把上一步获取到的 `sub_key` 拼接在 `img_key` 后面（下例记为 `raw_wbi_key`），遍历重排映射表 `MIXIN_KEY_ENC_TAB`，取出 `raw_wbi_key` 中对应位置的字符拼接得到新的字符串，截取前 32 位，即为 `mixin_key`。

   重排映射表 `MIXIN_KEY_ENC_TAB` 长为 64，内容如下：

   ```rust
   const MIXIN_KEY_ENC_TAB: [u8; 64] = [
       46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
       33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
       61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
       36, 20, 34, 44, 52
   ]
   ```

   重排操作如下例：

   ```rust
    fn gen_mixin_key(raw_wbi_key: impl AsRef<[u8]>) -> String {
        const MIXIN_KEY_ENC_TAB: [u8; 64] = [
            46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42,
            19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60,
            51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
        ];
        let raw_wbi_key = raw_wbi_key.as_ref();
        let mut mixin_key = {
            let binding = MIXIN_KEY_ENC_TAB
                .iter()
                // 此步操作即遍历 MIXIN_KEY_ENC_TAB，取出 raw_wbi_key 中对应位置的字符
                .map(|n| raw_wbi_key[*n as usize])
                // 并收集进数组内
                .collect::<Vec<u8>>();
            unsafe { String::from_utf8_unchecked(binding) }
        };
        let _ = mixin_key.split_off(32); // 截取前 32 位字符
        mixin_key
    }
   ```

   如 `img_key` -> `7cd084941338484aae1ad9425b84077c`、`sub_key` -> `4932caff0ff746eab6f01bf08b70ac45` 经过上述操作后得到 `mixin_key` -> `ea1db124af3c7062474693fa704f4ff8`。

3. 计算签名（即 `w_rid`）

   若下方内容为欲签名的**原始**请求参数（以 JavaScript Object 为例）

   ```javascript
   {
     foo: '114',
     bar: '514',
     zab: 1919810
   }
   ```

   `wts` 字段的值应为当前以秒为单位的 Unix 时间戳，如 `1702204169`

   复制一份参数列表，添加 `wts` 参数，即：

   ```javascript
   {
        foo: '114',
        bar: '514',
        zab: 1919810,
        wts: 1702204169
   }
   ```

   随后按键名升序排序后百分号编码 URL Query，拼接前面得到的 `mixin_key`，如 `bar=514&foo=114&wts=1702204169&zab=1919810ea1db124af3c7062474693fa704f4ff8`，计算其 MD5 即为 `w_rid`。

   需要注意的是：如果参数值含中文或特殊字符等，编码字符字母应当**大写** （部分库会错误编码为小写字母），空格应当编码为 `%20`（部分库按 `application/x-www-form-urlencoded` 约定编码为 `+`）, 具体正确行为可参考 [encodeURIComponent 函数](https://tc39.es/ecma262/multipage/global-object.html#sec-encodeuricomponent-uricomponent)

   例如：

   ```javascript
   {
     foo: 'one one four',
     bar: '五一四',
     baz: 1919810
   }
   ```

    应该被编码为 `bar=%E4%BA%94%E4%B8%80%E5%9B%9B&baz=1919810&foo=one%20one%20four`。

4. 向原始请求参数中添加 `w_rid`、`wts` 字段

   将上一步得到的 `w_rid` 以及前面的 `wts` 追加到**原始**请求参数编码得到的 URL Query 后即可，目前看来无需对原始请求参数排序。

   如前例最终得到 `bar=514&foo=114&zab=1919810&w_rid=8f6f2b5b3d485fe1886cec6a0be8c5d4&wts=1702204169`。

## Demo

含 [Python](#python)、[JavaScript](#javascript)、[Golang](#golang)、[C#](#csharp)、[Java](#java)、[Kotlin](#kotlin)、[Swift](#swift)、[C++](#cplusplus)、[Rust](#rust)、[Haskell](#haskell) 语言编写的 Demo

### Python

需要`requests`依赖

```python
from functools import reduce
from hashlib import md5
import urllib.parse
import time
import requests

mixinKeyEncTab = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
    33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
    61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
    36, 20, 34, 44, 52
]

def getMixinKey(orig: str):
    '对 imgKey 和 subKey 进行字符顺序打乱编码'
    return reduce(lambda s, i: s + orig[i], mixinKeyEncTab, '')[:32]

def encWbi(params: dict, img_key: str, sub_key: str):
    '为请求参数进行 wbi 签名'
    mixin_key = getMixinKey(img_key + sub_key)
    curr_time = round(time.time())
    params['wts'] = curr_time                                   # 添加 wts 字段
    params = dict(sorted(params.items()))                       # 按照 key 重排参数
    # 过滤 value 中的 "!'()*" 字符
    params = {
        k : ''.join(filter(lambda chr: chr not in "!'()*", str(v)))
        for k, v 
        in params.items()
    }
    query = urllib.parse.urlencode(params)                      # 序列化参数
    wbi_sign = md5((query + mixin_key).encode()).hexdigest()    # 计算 w_rid
    params['w_rid'] = wbi_sign
    return params

def getWbiKeys() -> tuple[str, str]:
    '获取最新的 img_key 和 sub_key'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Referer': 'https://www.bilibili.com/'
    }
    resp = requests.get('https://api.bilibili.com/x/web-interface/nav', headers=headers)
    resp.raise_for_status()
    json_content = resp.json()
    img_url: str = json_content['data']['wbi_img']['img_url']
    sub_url: str = json_content['data']['wbi_img']['sub_url']
    img_key = img_url.rsplit('/', 1)[1].split('.')[0]
    sub_key = sub_url.rsplit('/', 1)[1].split('.')[0]
    return img_key, sub_key

img_key, sub_key = getWbiKeys()

signed_params = encWbi(
    params={
        'foo': '114',
        'bar': '514',
        'baz': 1919810
    },
    img_key=img_key,
    sub_key=sub_key
)
query = urllib.parse.urlencode(signed_params)
print(signed_params)
print(query)
```

输出内容分别是进行 Wbi 签名的后参数的 key-Value 以及 url query 形式

```
{'bar': '514', 'baz': '1919810', 'foo': '114', 'wts': '1702204169', 'w_rid': 'd3cbd2a2316089117134038bf4caf442'}
bar=514&baz=1919810&foo=114&wts=1702204169&w_rid=d3cbd2a2316089117134038bf4caf442
```

### JavaScript

需要 `fetch`(浏览器、NodeJS等环境自带)、`md5` 依赖

<CodeGroup>
  <CodeGroupItem title="JavaScript">

```javascript
import md5 from 'md5'

const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52
]

// 对 imgKey 和 subKey 进行字符顺序打乱编码
const getMixinKey = (orig) => mixinKeyEncTab.map(n => orig[n]).join('').slice(0, 32)

// 为请求参数进行 wbi 签名
function encWbi(params, img_key, sub_key) {
  const mixin_key = getMixinKey(img_key + sub_key),
    curr_time = Math.round(Date.now() / 1000),
    chr_filter = /[!'()*]/g

  Object.assign(params, { wts: curr_time }) // 添加 wts 字段
  // 按照 key 重排参数
  const query = Object
    .keys(params)
    .sort()
    .map(key => {
      // 过滤 value 中的 "!'()*" 字符
      const value = params[key].toString().replace(chr_filter, '')
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .join('&')

  const wbi_sign = md5(query + mixin_key) // 计算 w_rid

  return query + '&w_rid=' + wbi_sign
}

// 获取最新的 img_key 和 sub_key
async function getWbiKeys() {
  const res = await fetch('https://api.bilibili.com/x/web-interface/nav', {
    headers: {
      // SESSDATA 字段
      Cookie: 'SESSDATA=xxxxxx',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      Referer: 'https://www.bilibili.com/'//对于直接浏览器调用可能不适用
    }
  })
  const { data: { wbi_img: { img_url, sub_url } } } = await res.json()

  return {
    img_key: img_url.slice(
      img_url.lastIndexOf('/') + 1,
      img_url.lastIndexOf('.')
    ),
    sub_key: sub_url.slice(
      sub_url.lastIndexOf('/') + 1,
      sub_url.lastIndexOf('.')
    )
  }
}

async function main() {
  const web_keys = await getWbiKeys()
  const params = { foo: '114', bar: '514', baz: 1919810 },
    img_key = web_keys.img_key,
    sub_key = web_keys.sub_key
  const query = encWbi(params, img_key, sub_key)
  console.log(query)
}

main()
```

  </CodeGroupItem>

  <CodeGroupItem title="TypeScript">

```typescript
import md5 from 'md5'

const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52
]

// 对 imgKey 和 subKey 进行字符顺序打乱编码
const getMixinKey = (orig: string) =>
  mixinKeyEncTab
    .map((n) => orig[n])
    .join("")
    .slice(0, 32);

// 为请求参数进行 wbi 签名
function encWbi(
  params: { [key: string]: string | number | object },
  img_key: string,
  sub_key: string
) {
  const mixin_key = getMixinKey(img_key + sub_key),
    curr_time = Math.round(Date.now() / 1000),
    chr_filter = /[!'()*]/g;

  Object.assign(params, { wts: curr_time }); // 添加 wts 字段
  // 按照 key 重排参数
  const query = Object.keys(params)
    .sort()
    .map((key) => {
      // 过滤 value 中的 "!'()*" 字符
      const value = params[key].toString().replace(chr_filter, "");
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");

  const wbi_sign = md5(query + mixin_key); // 计算 w_rid

  return query + "&w_rid=" + wbi_sign;
}
// 获取最新的 img_key 和 sub_key
async function getWbiKeys(SESSDATA: string) {
  const res = await fetch('https://api.bilibili.com/x/web-interface/nav', {
    headers: {
      // SESSDATA 字段
      Cookie: `SESSDATA=${SESSDATA}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      Referer: 'https://www.bilibili.com/'//对于直接浏览器调用可能不适用
    }
  })
  const {
    data: {
      wbi_img: { img_url, sub_url },
    },
  } = (await res.json()) as {
    data: {
      wbi_img: { img_url: string; sub_url: string };
    };
  };

  return {
    img_key: img_url.slice(
      img_url.lastIndexOf('/') + 1,
      img_url.lastIndexOf('.')
    ),
    sub_key: sub_url.slice(
      sub_url.lastIndexOf('/') + 1,
      sub_url.lastIndexOf('.')
    )
  }
}

async function main() {
  const web_keys = await getWbiKeys("SESSDATA的值")
  const params = { foo: '114', bar: '514', baz: 1919810 },
    img_key = web_keys.img_key,
    sub_key = web_keys.sub_key
  const query = encWbi(params, img_key, sub_key)
  console.log(query)
}

main()
```

  </CodeGroupItem>
</CodeGroup>

输出内容为进行 Wbi 签名的后参数的 url query 形式

```
bar=514&baz=1919810&foo=114&wts=1684805578&w_rid=bb97e15f28edf445a0e4420d36f0157e
```

### Golang

无第三方库

```go
package main

import (
    "bytes"
    "crypto/md5"
    "encoding/hex"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "net/url"
    "strconv"
    "strings"
    "time"
)

func main() {
    u, err := url.Parse("https://api.bilibili.com/x/space/wbi/acc/info?mid=1850091")
    if err != nil {
        panic(err)
    }
    fmt.Printf("orig: %s\n", u.String())
    err = Sign(u)
    if err != nil {
        panic(err)
    }
    fmt.Printf("signed: %s\n", u.String())

    // 获取 wbi 时未修改 header
    // 但实际使用签名后的 url 时发现风控较为严重
}

// Sign 为链接签名
func Sign(u *url.URL) error {
    return wbiKeys.Sign(u)
}

// Update 无视过期时间更新
func Update() error {
    return wbiKeys.Update()
}

func Get() (wk WbiKeys, err error) {
    if err = wk.update(false); err != nil {
        return WbiKeys{}, err
    }
    return wbiKeys, nil
}

var wbiKeys WbiKeys

type WbiKeys struct {
    Img            string
    Sub            string
    Mixin          string
    lastUpdateTime time.Time
}

// Sign 为链接签名
func (wk *WbiKeys) Sign(u *url.URL) (err error) {
    if err = wk.update(false); err != nil {
        return err
    }

    values := u.Query()

    values = removeUnwantedChars(values, '!', '\'', '(', ')', '*') // 必要性存疑?

    values.Set("wts", strconv.FormatInt(time.Now().Unix(), 10))

    // [url.Values.Encode] 内会对参数排序,
    // 且遍历 map 时本身就是无序的
    hash := md5.Sum([]byte(values.Encode() + wk.Mixin)) // Calculate w_rid
    values.Set("w_rid", hex.EncodeToString(hash[:]))
    u.RawQuery = values.Encode()
    return nil
}

// Update 无视过期时间更新
func (wk *WbiKeys) Update() (err error) {
    return wk.update(true)
}

// update 按需更新
func (wk *WbiKeys) update(purge bool) error {
    if !purge && time.Since(wk.lastUpdateTime) < time.Hour {
        return nil
    }

    // 测试下来不用修改 header 也能过
    resp, err := http.Get("https://api.bilibili.com/x/web-interface/nav")
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return err
    }

    nav := Nav{}
    err = json.Unmarshal(body, &nav)
    if err != nil {
        return err
    }

    if nav.Code != 0 && nav.Code != -101 { // -101 未登录时也会返回两个 key
        return fmt.Errorf("unexpected code: %d, message: %s", nav.Code, nav.Message)
    }
    img := nav.Data.WbiImg.ImgUrl
    sub := nav.Data.WbiImg.SubUrl
    if img == "" || sub == "" {
        return fmt.Errorf("empty image or sub url: %s", body)
    }

    // https://i0.hdslb.com/bfs/wbi/7cd084941338484aae1ad9425b84077c.png
    imgParts := strings.Split(img, "/")
    subParts := strings.Split(sub, "/")

    // 7cd084941338484aae1ad9425b84077c.png
    imgPng := imgParts[len(imgParts)-1]
    subPng := subParts[len(subParts)-1]

    // 7cd084941338484aae1ad9425b84077c
    wbiKeys.Img = strings.TrimSuffix(imgPng, ".png")
    wbiKeys.Sub = strings.TrimSuffix(subPng, ".png")

    wbiKeys.mixin()
    wbiKeys.lastUpdateTime = time.Now()
    return nil
}

func (wk *WbiKeys) mixin() {
    var mixin [32]byte
    wbi := wk.Img + wk.Sub
    for i := range mixin { // for i := 0; i < len(mixin); i++ {
        mixin[i] = wbi[mixinKeyEncTab[i]]
    }
    wk.Mixin = string(mixin[:])
}

var mixinKeyEncTab = [...]int{
    46, 47, 18, 2, 53, 8, 23, 32,
    15, 50, 10, 31, 58, 3, 45, 35,
    27, 43, 5, 49, 33, 9, 42, 19,
    29, 28, 14, 39, 12, 38, 41, 13,
    37, 48, 7, 16, 24, 55, 40, 61,
    26, 17, 0, 1, 60, 51, 30, 4,
    22, 25, 54, 21, 56, 59, 6, 63,
    57, 62, 11, 36, 20, 34, 44, 52,
}

func removeUnwantedChars(v url.Values, chars ...byte) url.Values {
    b := []byte(v.Encode())
    for _, c := range chars {
        b = bytes.ReplaceAll(b, []byte{c}, nil)
    }
    s, err := url.ParseQuery(string(b))
    if err != nil {
        panic(err)
    }
    return s
}

type Nav struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
    Ttl     int    `json:"ttl"`
    Data    struct {
        WbiImg struct {
            ImgUrl string `json:"img_url"`
            SubUrl string `json:"sub_url"`
        } `json:"wbi_img"`

        // ......
    } `json:"data"`
}
```

### CSharp

无需依赖外部库

```cs
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;

class Program
{
    private static HttpClient _httpClient = new();

    private static readonly int[] MixinKeyEncTab =
    {
        46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39,
        12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63,
        57, 62, 11, 36, 20, 34, 44, 52
    };

    //对 imgKey 和 subKey 进行字符顺序打乱编码
    private static string GetMixinKey(string orig)
    {
        return MixinKeyEncTab.Aggregate("", (s, i) => s + orig[i])[..32];
    }

    private static Dictionary<string, string> EncWbi(Dictionary<string, string> parameters, string imgKey,
        string subKey)
    {
        string mixinKey = GetMixinKey(imgKey + subKey);
        string currTime = DateTimeOffset.Now.ToUnixTimeSeconds().ToString();
        //添加 wts 字段
        parameters["wts"] = currTime;
        // 按照 key 重排参数
        parameters = parameters.OrderBy(p => p.Key).ToDictionary(p => p.Key, p => p.Value);
        //过滤 value 中的 "!'()*" 字符
        parameters = parameters.ToDictionary(
            kvp => kvp.Key,
            kvp => new string(kvp.Value.Where(chr => !"!'()*".Contains(chr)).ToArray())
        );
        // 序列化参数
        string query = new FormUrlEncodedContent(parameters).ReadAsStringAsync().Result;
        //计算 w_rid
        using MD5 md5 = MD5.Create();
        byte[] hashBytes = md5.ComputeHash(Encoding.UTF8.GetBytes(query + mixinKey));
        string wbiSign = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        parameters["w_rid"] = wbiSign;

        return parameters;
    }

    // 获取最新的 img_key 和 sub_key
      private static async Task<(string, string)> GetWbiKeys()
      {
          var httpClient = new HttpClient();
          httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
          httpClient.DefaultRequestHeaders.Referrer = new Uri("https://www.bilibili.com/");
      
          HttpResponseMessage responseMessage = await httpClient.SendAsync(new HttpRequestMessage
          {
              Method = HttpMethod.Get,
              RequestUri = new Uri("https://api.bilibili.com/x/web-interface/nav"),
          });
      
          JsonNode response = JsonNode.Parse(await responseMessage.Content.ReadAsStringAsync())!;
      
          string imgUrl = (string)response["data"]!["wbi_img"]!["img_url"]!;
          imgUrl = imgUrl.Split("/")[^1].Split(".")[0];
      
          string subUrl = (string)response["data"]!["wbi_img"]!["sub_url"]!;
          subUrl = subUrl.Split("/")[^1].Split(".")[0];
          return (imgUrl, subUrl);
      }


    public static async Task Main()
    {
        var (imgKey, subKey) = await GetWbiKeys();

        Dictionary<string, string> signedParams = EncWbi(
            parameters: new Dictionary<string, string>
            {
                { "foo", "114" },
                { "bar", "514" },
                { "baz", "1919810" }
            },
            imgKey: imgKey,
            subKey: subKey
        );

        string query = await new FormUrlEncodedContent(signedParams).ReadAsStringAsync();

        Console.WriteLine(query);
    }
}
```
输出内容为进行 Wbi 签名的后参数的 url query 形式

```
bar=514&baz=1919810&foo=114&wts=1687541921&w_rid=26e82b1b9b3a11dbb1807a9228a40d3b
```

### Java

```java
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.stream.Collectors;

public class WbiTest {
    private static final int[] mixinKeyEncTab = new int[]{
            46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
            33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
            61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
            36, 20, 34, 44, 52
    };

    private static final char[] hexDigits = "0123456789abcdef".toCharArray();

    public static String md5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            char[] result = new char[messageDigest.length * 2];
            for (int i = 0; i < messageDigest.length; i++) {
                result[i * 2] = hexDigits[(messageDigest[i] >> 4) & 0xF];
                result[i * 2 + 1] = hexDigits[messageDigest[i] & 0xF];
            }
            return new String(result);
        } catch (NoSuchAlgorithmException e) {
            return null;
        }
    }

    public static String getMixinKey(String imgKey, String subKey) {
        String s = imgKey + subKey;
        StringBuilder key = new StringBuilder();
        for (int i = 0; i < 32; i++)
            key.append(s.charAt(mixinKeyEncTab[i]));
        return key.toString();
    }

    public static String encodeURIComponent(Object o) {
        return URLEncoder.encode(o.toString(), StandardCharsets.UTF_8).replace("+", "%20");
    }

    public static void main(String[] args) {
        String imgKey = "653657f524a547ac981ded72ea172057";
        String subKey = "6e4909c702f846728e64f6007736a338";
        String mixinKey = getMixinKey(imgKey, subKey);
        System.out.println(mixinKey); // 72136226c6a73669787ee4fd02a74c27

        // 用TreeMap自动排序
        TreeMap<String, Object> map = new TreeMap<>();
        map.put("foo", "one one four");
        map.put("bar", "五一四");
        map.put("baz", 1919810);
        map.put("wts", System.currentTimeMillis() / 1000);
        String param = map.entrySet().stream()
                .map(it -> String.format("%s=%s", it.getKey(), encodeURIComponent(it.getValue())))
                .collect(Collectors.joining("&"));
        String s = param + mixinKey;

        String wbiSign = md5(s);
        System.out.println(wbiSign);
        String finalParam = param + "&w_rid=" + wbiSign;
        System.out.println(finalParam);
    }
}
```

### Kotlin

说明: 为了便于使用和缓存, 重新编写为实体类形式, 并拆分了多个文件. 使用官方的JSON序列化. (可以根据需要换成其他的)

WbiParams.kt

```kotlin
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonPrimitive

private fun JsonElement?.get(): String {
    check(this != null) { "No contents found" }
    return this.jsonPrimitive.content.split('/').last().removeSuffix(".png")
}

private val mixinKeyEncTab = intArrayOf(
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
    33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
    61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
    36, 20, 34, 44, 52
)

@Serializable
data class WbiParams(
    val imgKey: String,
    val subKey: String,
) {
    // 此处整合了切分参数(直接传入{img_url:string, sub_url:string}即可), 不需要可以删掉
    constructor(wbiImg: JsonObject) : this(wbiImg["img_url"].get(), wbiImg["sub_url"].get())

    private val mixinKey: String
        get() = (imgKey + subKey).let { s ->
            buildString {
                repeat(32) {
                    append(s[mixinKeyEncTab[it]])
                }
            }
        }

    // 创建对象(GET获取或者读缓存, 比如Redis)之后, 直接调用此函数处理
    fun enc(params: Map<String, Any?>): String {
        val sorted = params.filterValues { it != null }.toSortedMap()
        return buildString {
            append(sorted.toQueryString())
            val wts = System.currentTimeMillis() / 1000
            sorted["wts"] = wts
            append("&wts=")
            append(wts)
            append("&w_rid=")
            append((sorted.toQueryString() + mixinKey).toMD5())
        }
    }
}
```

Extensions.kt

```kotlin
import java.security.MessageDigest

private val hexDigits = "0123456789abcdef".toCharArray()

fun ByteArray.toHexString() = buildString(this.size shl 1) {
    this@toHexString.forEach { byte ->
        append(hexDigits[byte.toInt() ushr 4 and 15])
        append(hexDigits[byte.toInt() and 15])
    }
}

fun String.toMD5(): String {
    val md = MessageDigest.getInstance("MD5")
    val digest = md.digest(this.toByteArray())
    return digest.toHexString()
}

fun Map<String, Any?>.toQueryString() = this.filterValues { it != null }.entries.joinToString("&") { (k, v) ->
    "${k.encodeURIComponent()}=${v!!.encodeURIComponent()}"
}
```

获取和使用案例略

### PHP

来自[SocialSisterYi/bilibili-API-collect#813](https://github.com/SocialSisterYi/bilibili-API-collect/issues/813)

```php
<?php
/**
 * B站 Wbi 测试
 * @author Prk
 */


class Bilibili {

    private $mixinKeyEncTab = [
        46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
        33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
        61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
        36, 20, 34, 44, 52
    ];

    function __construct() {
    }

    public function reQuery(array $query) {
        $wbi_keys = $this->getWbiKeys();
        return $this->encWbi($query, $wbi_keys['img_key'], $wbi_keys['sub_key']);
    }

    private function getMixinKey($orig) {
        $t = '';
        foreach ($this->mixinKeyEncTab as $n) $t .= $orig[$n];
        return substr($t, 0, 32);
    }

    private function encWbi($params, $img_key, $sub_key) {
        $mixin_key = $this->getMixinKey($img_key . $sub_key);
        $curr_time = time();
        $chr_filter = "/[!'()*]/";

        $query = [];
        $params['wts'] = $curr_time;

        ksort($params);

        foreach ($params as $key => $value) {
            $value = preg_replace($chr_filter, '', $value);
            $query[] = urlencode($key) . '=' . urlencode($value);
        }

        $query = implode('&', $query);
        $wbi_sign = md5($query . $mixin_key);

        return $query . '&w_rid=' . $wbi_sign;
    }

    private function getWbiKeys() {
        $resp = @json_decode(
            $this->curl_get(
                'https://api.bilibili.com/x/web-interface/nav',
                null,
                'https://www.bilibili.com/'
            ), true
        );

        if (!$resp) throw new Exception('请求失败');

        $img_url = $resp['data']['wbi_img']['img_url'];
        $sub_url = $resp['data']['wbi_img']['sub_url'];

        return [
            'img_key' => substr(basename($img_url), 0, strpos(basename($img_url), '.')),
            'sub_key' => substr(basename($sub_url), 0, strpos(basename($sub_url), '.'))
        ];
    }

    private function curl_get($url, $cookies = null, $referer = 'https://www.bilibili.com/', $ua = null, $proxy = null, $header = []) {
        $ch = curl_init();
        $header[] = "Accept: */*";
        $header[] = "Accept-Language: en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7";
        $header[] = "Connection: close";
        $header[]="Referer:https://www.bilibili.com/";
        $header[] = "Cache-Control: max-age=0";
        curl_setopt_array($ch, [
            CURLOPT_HTTPGET         =>  1,
            CURLOPT_CUSTOMREQUEST   =>  'GET',
            CURLOPT_RETURNTRANSFER  =>  1,
            CURLOPT_HTTPHEADER      =>  $header,
            CURLOPT_ENCODING        =>  '',
            CURLOPT_URL             =>  $url,
            CURLOPT_USERAGENT       =>  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36 Edg/102.0.1245.39',
            CURLOPT_TIMEOUT         =>  15
        ]);

        if ($cookies) curl_setopt(
            $ch,
            CURLOPT_COOKIE,
            $cookies
        );

        if ($referer) curl_setopt_array($ch, [
            CURLOPT_AUTOREFERER =>  $referer,
            CURLOPT_REFERER     =>  $referer
        ]);

        $content = curl_exec($ch);
        curl_close($ch);
        return $content;
    }
}

$c = new Bilibili();
echo $c->reQuery(['foo' => '114', 'bar' => '514', 'baz' => 1919810]);
// bar=514&baz=1919810&foo=114&wts=1700384803&w_rid=4614cb98d60a43e50c3a3033fe3d116b
```

### Rust

需要 serde、serde_json、reqwest、tokio 以及 md5

```rust
use reqwest::header::USER_AGENT;
use serde::Deserialize;
use std::time::{SystemTime, UNIX_EPOCH};

const MIXIN_KEY_ENC_TAB: [usize; 64] = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29,
    28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25,
    54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
];

#[derive(Deserialize)]
struct WbiImg {
    img_url: String,
    sub_url: String,
}

#[derive(Deserialize)]
struct Data {
    wbi_img: WbiImg,
}

#[derive(Deserialize)]
struct ResWbi {
    data: Data,
}

// 对 imgKey 和 subKey 进行字符顺序打乱编码
fn get_mixin_key(orig: &[u8]) -> String {
    MIXIN_KEY_ENC_TAB
        .iter()
        .take(32)
        .map(|&i| orig[i] as char)
        .collect::<String>()
}

fn get_url_encoded(s: &str) -> String {
    s.chars()
        .filter_map(|c| match c.is_ascii_alphanumeric() || "-_.~".contains(c) {
            true => Some(c.to_string()),
            false => {
                // 过滤 value 中的 "!'()*" 字符
                if "!'()*".contains(c) {
                    return None;
                }
                let encoded = c
                    .encode_utf8(&mut [0; 4])
                    .bytes()
                    .fold("".to_string(), |acc, b| acc + &format!("%{:02X}", b));
                Some(encoded)
            }
        })
        .collect::<String>()
}

// 为请求参数进行 wbi 签名
fn encode_wbi(params: Vec<(&str, String)>, (img_key, sub_key): (String, String)) -> String {
    let cur_time = match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(t) => t.as_secs(),
        Err(_) => panic!("SystemTime before UNIX EPOCH!"),
    };
    _encode_wbi(params, (img_key, sub_key), cur_time)
}

fn _encode_wbi(
    mut params: Vec<(&str, String)>,
    (img_key, sub_key): (String, String),
    timestamp: u64,
) -> String {
    let mixin_key = get_mixin_key((img_key + &sub_key).as_bytes());
    // 添加当前时间戳
    params.push(("wts", timestamp.to_string()));
    // 重新排序
    params.sort_by(|a, b| a.0.cmp(b.0));
    // 拼接参数
    let query = params
        .iter()
        .map(|(k, v)| format!("{}={}", get_url_encoded(k), get_url_encoded(v)))
        .collect::<Vec<_>>()
        .join("&");
    // 计算签名
    let web_sign = format!("{:?}", md5::compute(query.clone() + &mixin_key));
    // 返回最终的 query
    query + &format!("&w_rid={}", web_sign)
}

async fn get_wbi_keys() -> Result<(String, String), reqwest::Error> {
    let client = reqwest::Client::new();
    let ResWbi { data:Data{wbi_img} } = client
    .get("https://api.bilibili.com/x/web-interface/nav")
    .header(USER_AGENT,"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
    .header("Referer","https://www.bilibili.com/")
     // SESSDATA=xxxxx
    .header("Cookie", "SESSDATA=xxxxx")
    .send()
    .await?
    .json::<ResWbi>()
    .await?;
    Ok((
        take_filename(wbi_img.img_url).unwrap(),
        take_filename(wbi_img.sub_url).unwrap(),
    ))
}

fn take_filename(url: String) -> Option<String> {
    url.rsplit_once('/')
        .and_then(|(_, s)| s.rsplit_once('.'))
        .map(|(s, _)| s.to_string())
}

#[tokio::main]
async fn main() {
    let keys = get_wbi_keys().await.unwrap();
    let params = vec![
        ("foo", String::from("114")),
        ("bar", String::from("514")),
        ("baz", String::from("1919810")),
    ];
    let query = encode_wbi(params, keys);
    println!("{}", query);
}

// 取自文档描述的测试用例
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_filename() {
        assert_eq!(
            take_filename(
                "https://i0.hdslb.com/bfs/wbi/7cd084941338484aae1ad9425b84077c.png".to_string()
            ),
            Some("7cd084941338484aae1ad9425b84077c".to_string())
        );
    }

    #[test]
    fn test_get_mixin_key() {
        let concat_key =
            "7cd084941338484aae1ad9425b84077c".to_string() + "4932caff0ff746eab6f01bf08b70ac45";
        assert_eq!(
            get_mixin_key(concat_key.as_bytes()),
            "ea1db124af3c7062474693fa704f4ff8"
        );
    }

    #[test]
    fn test_encode_wbi() {
        let params = vec![
            ("foo", String::from("114")),
            ("bar", String::from("514")),
            ("zab", String::from("1919810")),
        ];
        assert_eq!(
            _encode_wbi(
                params,
                (
                    "7cd084941338484aae1ad9425b84077c".to_string(),
                    "4932caff0ff746eab6f01bf08b70ac45".to_string()
                ),
                1702204169
            ),
            "bar=514&foo=114&wts=1702204169&zab=1919810&w_rid=8f6f2b5b3d485fe1886cec6a0be8c5d4"
                .to_string()
        )
    }
}
```

### Swift

需要 [Alamofire](https://github.com/Alamofire/Alamofire) 和 [SwiftyJSON](https://github.com/SwiftyJSON/SwiftyJSON) 库

```swift
import Alamofire
import CommonCrypto
import Foundation
import SwiftyJSON

func biliWbiSign(param: String, completion: @escaping (String?) -> Void) {
    func getMixinKey(orig: String) -> String {
        return String(mixinKeyEncTab.map { orig[orig.index(orig.startIndex, offsetBy: $0)] }.prefix(32))
    }
    
    func encWbi(params: [String: Any], imgKey: String, subKey: String) -> [String: Any] {
        var params = params
        let mixinKey = getMixinKey(orig: imgKey + subKey)
        let currTime = Int(Date().timeIntervalSince1970)
        params["wts"] = currTime
        let query = params.sorted {
            $0.key < $1.key
        }.map { (key, value) -> String in
            let stringValue: String
            if let doubleValue = value as? Double, doubleValue.truncatingRemainder(dividingBy: 1) == 0 {
                stringValue = String(Int(doubleValue))
            } else {
                stringValue = String(describing: value)
            }
            let filteredValue = stringValue.filter { !"!'()*".contains($0) }
            return "\(key)=\(filteredValue)"
        }.joined(separator: "&")
        let wbiSign = calculateMD5(string: query + mixinKey)
        params["w_rid"] = wbiSign
        return params
    }
    
    func getWbiKeys(completion: @escaping (Result<(imgKey: String, subKey: String), Error>) -> Void) {
        let headers: HTTPHeaders = [
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": "https://www.bilibili.com/"
        ]
       
        AF.request("https://api.bilibili.com/x/web-interface/nav", headers: headers).responseJSON { response in
            switch response.result {
            case .success(let value):
                let json = JSON(value)
                let imgURL = json["data"]["wbi_img"]["img_url"].string ?? ""
                let subURL = json["data"]["wbi_img"]["sub_url"].string ?? ""
                let imgKey = imgURL.components(separatedBy: "/").last?.components(separatedBy: ".").first ?? ""
                let subKey = subURL.components(separatedBy: "/").last?.components(separatedBy: ".").first ?? ""
                completion(.success((imgKey, subKey)))
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }

    func calculateMD5(string: String) -> String {
        let data = Data(string.utf8)
        var digest = [UInt8](repeating: 0, count: Int(CC_MD5_DIGEST_LENGTH))
        _ = data.withUnsafeBytes {
            CC_MD5($0.baseAddress, CC_LONG(data.count), &digest)
        }
        return digest.map { String(format: "%02hhx", $0) }.joined()
    }
    
    let mixinKeyEncTab = [
        46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
        33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
        61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
        36, 20, 34, 44, 52
    ]
    
    getWbiKeys { result in
        switch result {
        case .success(let keys):
            let spdParam = param.components(separatedBy: "&")
            var spdDicParam = [String: String]()
            for pair in spdParam {
                let components = pair.components(separatedBy: "=")
                if components.count == 2 {
                    spdDicParam[components[0]] = components[1]
                }
            }
            
            let signedParams = encWbi(params: spdDicParam, imgKey: keys.imgKey, subKey: keys.subKey)
            let query = signedParams.map { "\($0.key)=\($0.value)" }.joined(separator: "&")
            completion(query)
        case .failure(let error):
            print("Error getting keys: \(error)")
            completion(nil)
        }
    }
}

// 使用示例
biliWbiSign(param: "bar=514&foo=114&zab=1919810") {
    signedQuery in
    if let signedQuery = signedQuery {
        print("签名后的参数: \(signedQuery)")
    } else {
        print("签名失败")
    }
}

RunLoop.main.run()//程序类型为命令行程序时需要添加这行代码

```

```text
签名后的参数: bar=514&wts=1741082093&foo=114&zab=1919810&w_rid=04775bb3debbb45bab86a93a1c08d12a
```


### CPlusPlus

需要 c++ 23 标准库，[cpr](https://github.com/libcpr/cpr)、[cryptopp](https://github.com/weidai11/cryptopp)、[nlohmann/json](https://github.com/nlohmann/json) 等依赖

```c++
#include <array>    // std::array
#include <locale>   // std::locale
#include <print>    // std::println

/// thrid party libraries
#include <cpr/cpr.h>
#include <cryptopp/md5.h>
#include <cryptopp/hex.h>
#include <nlohmann/json.hpp>

/*
 * 注意，假定不会发生错误！
 */
class Wbi {
    constexpr static std::array<uint8_t, 64> MIXIN_KEY_ENC_TAB_ = {
        46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
        27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
        37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4,
        22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52
    };

    /* 获取 md5 hex(lower) */
    static std::string Get_md5_hex(const std::string &Input_str) {
        CryptoPP::Weak1::MD5 hash;
        std::string          md5_hex;

        CryptoPP::StringSource ss(Input_str, true,
            new CryptoPP::HashFilter(hash,
                new CryptoPP::HexEncoder(
                    new CryptoPP::StringSink(md5_hex)
                )
            )
        );

        std::ranges::for_each(md5_hex, [](char &x) { x = std::tolower(x); });
        return md5_hex;
    }

public:
    /* 将 json 转换为 url 编码字符串 */
    static std::string Json_to_url_encode_str(const nlohmann::json &Json) {
        std::string encode_str;
        for (const auto &[key, value]: Json.items()) {
            encode_str.append(key).append("=").append(cpr::util::urlEncode(value.is_string() ? value.get<std::string>() : to_string(value))).append("&");
        }

        // remove the last '&'
        encode_str.resize(encode_str.size() - 1, '\0');
        return encode_str;
    }

    /* 获取 wbi key */
    static std::pair<std::string, std::string> Get_wbi_key() {
        const auto url    = cpr::Url {"https://api.bilibili.com/x/web-interface/nav"};
        const auto cookie = cpr::Cookies {
            {"SESSDATA", "xxxxxxxxxxxx"},
        };
        const auto header = cpr::Header {
            {"User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"},
            {"Referer", "https://www.bilibili.com/"},
        };
        const auto response = cpr::Get(url, cookie, header);

        nlohmann::json json = nlohmann::json::parse(response.text);

        const std::string img_url = json["data"]["wbi_img"]["img_url"];
        const std::string sub_url = json["data"]["wbi_img"]["sub_url"];

        std::string img_key = img_url.substr(img_url.find("wbi/") + 4, img_url.find(".png") - img_url.find("wbi/") - 4);
        std::string sub_key = sub_url.substr(sub_url.find("wbi/") + 4, sub_url.find(".png") - sub_url.find("wbi/") - 4);
        return {img_key, sub_key};
    }

    /* 获取 mixin key */
    static std::string Get_mixin_key(const std::string &Img_key, const std::string &Sub_key) {
        std::string raw_wbi_key_str = Img_key + Sub_key;
        std::string result;

        std::ranges::for_each(MIXIN_KEY_ENC_TAB_, [&result, &raw_wbi_key_str](const uint8_t x) {
            result.push_back(raw_wbi_key_str.at(x));
        });

        return result.substr(0, 32);
    }

    /* 计算签名(w_rid) */
    static std::string Calc_sign(nlohmann::json &Params, const std::string &Mixin_key) {
        Params["wts"] = std::chrono::duration_cast<std::chrono::seconds>(std::chrono::system_clock::now().time_since_epoch()).count();

        const std::string encode_str = Json_to_url_encode_str(Params).append(Mixin_key);
        return Get_md5_hex(encode_str);
    }
};


int main() {
    nlohmann::json Params;
    // qn=32&fnver=0&fnval=4048&fourk=1&avid=1755630705&cid=1574294582
    Params["qn"]    = 32;
    Params["fnver"] = 0;
    Params["fnval"] = 4048;
    Params["fourk"] = 1;
    Params["avid"]  = 1755630705;
    Params["cid"]   = 1574294582;

    auto       [img_key, sub_key] = Wbi::Get_wbi_key();
    const auto mixin_key          = Wbi::Get_mixin_key(img_key, sub_key);
    const auto w_rid              = Wbi::Calc_sign(Params, mixin_key);
    std::println("{}", Wbi::Json_to_url_encode_str(Params) + "&w_rid=" + w_rid);
}
```

```text
avid=1755630705&cid=1574294582&fnval=4048&fnver=0&fourk=1&qn=32&wts=1717922933&w_rid=43571b838a1611fa121189083cfc1784
```

### Haskell

无第三方依赖: `base`, `Cabal-syntax`, `bytestring`, `containers`<br />
注: 此处使用自写的 URI 编码模块, 实际可用别的第三方库替代

`Main.hs`:
```hs
module Main (wbi, main) where

import Data.ByteString.Char8 (pack)
import qualified Data.Map.Strict as Map
import Distribution.Utils.MD5 (md5, showMD5)
import URIEncoder (encodeURIComponent)
import Data.Time.Clock.System (getSystemTime, systemSeconds)

mixinKeyEncTab :: [Int]
mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52
  ]

getMixinKey :: String -> String -> String
getMixinKey imgKey subKey =
  let s = imgKey ++ subKey
  in map (\i -> s !! (mixinKeyEncTab !! i)) [0..31]

join :: [String] -> String -> String
join arr ins = concatMap (++ ins) (init arr) ++ last arr

wbi :: String -> String -> Integer -> Map.Map String String -> String
wbi imgKey subKey wts params =
  let orig = join (map (\(k, v) -> encodeURIComponent k ++ "=" ++ encodeURIComponent v) (Map.toList $ Map.insert "wts" (show wts) params)) "&"
  in orig ++ "&w_rid=" ++ showMD5 (md5 $ pack $ orig ++ getMixinKey imgKey subKey)

main :: IO ()
main = do -- hard encode for test
  let params1 = Map.fromList [("aid", "2")]
      params2 = Map.fromList [("foo", "114")
                            ,("bar", "514")
                            ,("hello", "世 界")
                            ]
      imgKey = "7cd084941338484aae1ad9425b84077c"
      subKey = "4932caff0ff746eab6f01bf08b70ac45"
  wts1 <- getSystemTime 
  putStrLn $ wbi imgKey subKey (toInteger $ systemSeconds wts1) params1
  wts2 <- getSystemTime 
  putStrLn $ wbi imgKey subKey (toInteger $ systemSeconds wts2) params2
```

`URIEncoder.hs`<!--(by DS)-->:
```hs
module URIEncoder (encodeURIComponent) where

import Data.Char (ord, chr, intToDigit)
import Data.Bits (shiftL, shiftR, (.&.))
import Data.List (isInfixOf)

-- ES 19.2.6.4 encodeURIComponent ( uriComponent )
encodeURIComponent :: String -> String
encodeURIComponent input = case encode input "" of
  Right result -> result
  Left err -> error err

-- ES 19.2.6.5 Encode ( string, extraUnescaped )
encode :: String -> String -> Either String String
encode string extraUnescaped = loop 0 string
  where
    alwaysUnescaped = ['A'..'Z'] ++ ['a'..'z'] ++ ['0'..'9'] ++ "-.!~*'()"
    unescapedSet = alwaysUnescaped ++ extraUnescaped
    
    loop k str
      | k >= length str = Right []
      | otherwise = case codePointAt str k of
          (Nothing, _) -> Left "Unpaired surrogate"
          (Just (cp, _), newK) ->
            if [str !! k] `isInfixOf` unescapedSet
            then (str !! k :) <$> loop (k + 1) str
            else do
              bytes <- utf8Encode cp
              let escaped = concatMap percentEncode bytes
              rest <- loop newK str
              Right (escaped ++ rest)

codePointAt :: String -> Int -> (Maybe (Int, Int), Int)
codePointAt s k
  | k >= length s = (Nothing, k)
  | otherwise =
      let c1 = ord (s !! k)
      in if 0xD800 <= c1 && c1 <= 0xDBFF && k+1 < length s
         then let c2 = ord (s !! (k+1))
              in if 0xDC00 <= c2 && c2 <= 0xDFFF
                 then ( Just (0x10000 + ((c1 - 0xD800) `shiftL` 10) + (c2 - 0xDC00), 2)
                     , k + 2 )
                 else (Just (c1, 1), k + 1)
         else (Just (c1, 1), k + 1)

utf8Encode :: Int -> Either String [Int]
utf8Encode cp
  | cp < 0 = Left "Invalid code point"
  | cp <= 0x007F = Right [cp]
  | cp <= 0x07FF = Right
      [ 0xC0 + (cp `shiftR` 6)
      , 0x80 + (cp .&. 0x3F) ]
  | cp <= 0xFFFF = Right
      [ 0xE0 + (cp `shiftR` 12)
      , 0x80 + ((cp `shiftR` 6) .&. 0x3F)
      , 0x80 + (cp .&. 0x3F) ]
  | cp <= 0x10FFFF = Right
      [ 0xF0 + (cp `shiftR` 18)
      , 0x80 + ((cp `shiftR` 12) .&. 0x3F)
      , 0x80 + ((cp `shiftR` 6) .&. 0x3F)
      , 0x80 + (cp .&. 0x3F) ]
  | otherwise = Left "Code point out of range"

percentEncode :: Int -> String
percentEncode byte = '%' : toHex byte
  where
    toHex n = [hexDigit (n `div` 16), hexDigit (n `mod` 16)]
    hexDigit x
      | x < 10 = intToDigit x
      | otherwise = chr (x - 10 + ord 'A')
```

输出:
```text
aid=2&wts=1744823207&w_rid=a3cd246bd42c066932752b24694eaf0d
bar=514&foo=114&hello=%E4%B8%96%20%E7%95%8C&wts=1744823207&w_rid=93acf59d85f74453e40cea00056c3daf
```


# video/info.md

# 视频基本信息

<img src="../../assets/img/ploading.gif" width="100" height="100"/>

## 获取视频详细信息(web端)

> https://api.bilibili.com/x/web-interface/wbi/view  
> https://api.bilibili.com/x/web-interface/view

*请求方式：GET*

认证方式：Cookie(SESSDATA)

限制游客访问的视频需要登录

**url参数：**

| 参数名  | 类型  | 内容     | 必要性    | 备注            |
|------|-----|--------|--------|---------------|
| aid  | num | 稿件avid | 必要(可选) | avid与bvid任选一个 |
| bvid | str | 稿件bvid | 必要(可选) | avid与bvid任选一个 |

**json回复：**

根对象：

| 字段      | 类型  | 内容   | 备注                                                                                 |
|---------|-----|------|------------------------------------------------------------------------------------|
| code    | num | 返回值  | 0：成功<br />-400：请求错误<br />-403：权限不足<br />-404：无视频<br />62002：稿件不可见<br />62004：稿件审核中<br />62012：仅UP主自己可见 |
| message | str | 错误信息 | 默认为0                                                                               |
| ttl     | num | 1    |                                                                                    |
| data    | obj | 信息本体 |                                                                                    |

`data`对象：

| 字段                    | 类型    | 内容                           | 备注                                                         |
| ----------------------- | ------- | ------------------------------ | ------------------------------------------------------------ |
| bvid                    | str     | 稿件bvid                       |                                                              |
| aid                     | num     | 稿件avid                       |                                                              |
| videos                  | num     | 稿件分P总数                    | 默认为1                                                      |
| tid                     | num     | 分区tid                        | 详情见[视频分区一览](video_zone.md)                          |
| tid_v2                  | num     | 分区tid (v2)                   | 详情见[视频分区一览 (v2)](video_zone_v2.md)                  |
| tname                   | str     | 子分区名称                     |                                                              |
| tname_v2                | str     | 子分区名称 (v2)                |                                                              |
| copyright               | num     | 视频类型                       | 1：原创<br />2：转载                                         |
| pic                     | str     | 稿件封面图片url                |                                                              |
| title                   | str     | 稿件标题                       |                                                              |
| pubdate                 | num     | 稿件发布时间                   | 秒级时间戳                                                   |
| ctime                   | num     | 用户投稿时间                   | 秒级时间戳                                                   |
| desc                    | str     | 视频简介                       |                                                              |
| desc_v2                 | array   | 新版视频简介                   |                                                              |
| state                   | num     | 视频状态                       | 详情见[属性数据文档](attribute_data.md#state字段值稿件状态)  |
| duration                | num     | 稿件总时长(所有分P)            | 单位为秒                                                     |
| forward                 | num     | 撞车视频跳转avid               | 仅撞车视频存在此字段                                         |
| mission_id              | num     | 稿件参与的活动id               |                                                              |
| redirect_url            | str     | 重定向url                      | 仅番剧或影视视频存在此字段<br />用于番剧&影视的av/bv->ep     |
| rights                  | obj     | 视频属性标志                   |                                                              |
| owner                   | obj     | 视频UP主信息                   |                                                              |
| stat                    | obj     | 视频状态数                     |                                                              |
| argue_info              | obj     | 争议/警告信息                  |                                                              |
| dynamic                 | str     | 视频同步发布的的动态的文字内容 |                                                              |
| cid                     | num     | 视频1P cid                     |                                                              |
| dimension               | obj     | 视频1P分辨率                   |                                                              |
| premiere                |         | null                           |                                                              |
| teenage_mode            | num     |                                | 用于青少年模式                                               |
| is_chargeable_season    | bool    |                                |                                                              |
| is_story                | bool    | 是否可以在 Story Mode 展示?    |                                                              |
| is_upower_exclusive     | bool    | 是否为充电专属视频             |                                                              |
| is_upower_play          | bool    |                                |                                                              |
| is_upower_preview       | bool    | 充电专属视频是否支持试看       |                                                              |
| no_cache                | bool    | 是否不允许缓存?                |                                                              |
| pages                   | array   | 视频分P列表                    |                                                              |
| subtitle                | obj     | 视频CC字幕信息                  |                                                             |
| ugc_season              | obj     | 视频合集信息                   | 不在合集中的视频无此项                                                               |
| staff                   | array   | 合作成员列表                   | 非合作视频无此项                                             |
| is_season_display       | bool    |                                |                                                              |
| user_garb               | obj     | 用户装扮信息                   |                                                              |
| honor_reply             | obj     |                                |                                                              |
| like_icon               | str     | 空串                           |                                                              |
| need_jump_bv            | bool    | 需要跳转到BV号?                |                                                              |
| disable_show_up_info    | bool    | 禁止展示UP主信息?              |                                                              |
| is_story_play           | bool    | 是否为 Story Mode 视频?        |                                                              |
| is_view_self            | bool    | 是否为自己投稿的视频?          |                                                              |

`data`中的`desc_v2`数组：

| 项   | 类型  | 内容     | 备注  |
|-----|-----|--------|-----|
| 0   | obj | 新版简介内容 |     |

`desc_v2`数组中的对象：

| 字段       | 类型  | 内容   | 备注  |
|----------|-----|------|-----|
| raw_text | str | 简介内容 |type=1时显示原文<br />type=2时显示'@'+raw_text+' '并链接至biz_id的主页|
| type     | num | 类型 |1：普通，2：@他人|
| biz_id   | num |被@用户的mid|=0，当type=1|

`data`中的`rights`对象：

| 字段              | 类型  | 内容           | 备注     |
|-----------------|-----|--------------|--------|
| bp              | num | 是否允许承包       |        |
| elec            | num | 是否支持充电       |        |
| download        | num | 是否允许下载       |        |
| movie           | num | 是否电影         |        |
| pay             | num | 是否PGC付费      |        |
| hd5             | num | 是否有高码率       |        |
| no_reprint      | num | 是否显示“禁止转载”标志 |        |
| autoplay        | num | 是否自动播放       |        |
| ugc_pay         | num | 是否UGC付费      |        |
| is_cooperation  | num | 是否为联合投稿      |        |
| ugc_pay_preview | num | 0            | 作用尚不明确 |
| no_background   | num | 0            | 作用尚不明确 |
| clean_mode      | num | 0            | 作用尚不明确 |
| is_stein_gate   | num | 是否为互动视频      |        |
| is_360          | num | 是否为全景视频      |        |
| no_share        | num | 0            | 作用尚不明确 |
| arc_pay         | num | 0            | 作用尚不明确 |
| free_watch      | num | 0            | 作用尚不明确 |

`data`中的`owner`对象：

| 字段   | 类型  | 内容     | 备注  |
|------|-----|--------|-----|
| mid  | num | UP主mid |     |
| name | str | UP主昵称  |     |
| face | str | UP主头像  |     |

`data`中的`stat`对象：

| 字段       | 类型 | 内容         | 备注    |
| ---------- | ---- | ------------ | ------- |
| aid        | num  | 稿件avid     |         |
| view       | num  | 播放数       |         |
| danmaku    | num  | 弹幕数       |         |
| reply      | num  | 评论数       |         |
| favorite   | num  | 收藏数       |         |
| coin       | num  | 投币数       |         |
| share      | num  | 分享数       |         |
| now_rank   | num  | 当前排名     |         |
| his_rank   | num  | 历史最高排行 |         |
| like       | num  | 获赞数       |         |
| dislike    | num  | 点踩数       | 恒为`0` |
| evaluation | str  | 视频评分     |         |
| vt         | int  | 作用尚不明确 | 恒为`0` |

`data`中的`argue_info`对象：

| 字段       | 类型 | 内容              | 备注         |
| ---------- | ---- | ----------------- | ------------ |
| argue_link | str  |                   | 作用尚不明确 |
| argue_msg  | str  | 警告/争议提示信息 |              |
| argue_type | int  |                   | 作用尚不明确 |

`data`中的`pages`数组：

| 项   | 类型  | 内容       | 备注      |
|-----|-----|----------|---------|
| 0   | obj | 1P内容     | 无分P仅有此项 |
| n   | obj | (n+1)P内容 |         |
| ……  | obj | ……       | ……      |

`pages`数组中的对象：

| 字段        | 类型  | 内容        | 备注                                          |
|-----------|-----|-----------|---------------------------------------------|
| cid       | num | 分P cid    |                                             |
| page      | num | 分P序号      | 从1开始                                        |
| from      | str | 视频来源      | vupload：普通上传（B站）<br />hunan：芒果TV<br />qq：腾讯 |
| part      | str | 分P标题      |                                             |
| duration  | num | 分P持续时间    | 单位为秒                                        |
| vid       | str | 站外视频vid   | 仅站外视频有效                                     |
| weblink   | str | 站外视频跳转url | 仅站外视频有效                                     |
| dimension | obj | 当前分P分辨率   | 部分较老视频无分辨率值                                 |

`pages`数组中的对象中的`dimension`对象(同`data`中的`dimension`对象)：

| 字段     | 类型  | 内容      | 备注             |
|--------|-----|---------|----------------|
| width  | num | 当前分P 宽度 |                |
| height | num | 当前分P 高度 |                |
| rotate | num | 是否将宽高对换 | 0：正常<br />1：对换 |

`subtitle`对象：

| 字段           | 类型    | 内容       | 备注  |
|--------------|-------|----------|-----|
| allow_submit | bool  | 是否允许提交字幕 |     |
| list         | array | 字幕列表     | 未登录为空 |

`subtitle`对象中的`list`数组：

| 项   | 类型  | 内容      | 备注  |
|-----|-----|---------|-----|
| 0   | obj | 字幕1     |     |
| n   | obj | 字幕(n+1) |     |
| ……  | obj | ……      | ……  |

`list`数组中的对象：

| 字段           | 类型   | 内容            | 备注  |
|--------------|------|---------------|-----|
| id           | num  | 字幕id          |     |
| lan          | str  | 字幕语言          |     |
| lan_doc      | str  | 字幕语言名称        |     |
| is_lock      | bool | 是否锁定          |     |
| author_mid   | num  | 字幕上传者mid      |     |
| subtitle_url | str  | json格式字幕文件url |     |
| author       | obj  | 字幕上传者信息       |     |

`list`数组中的对象中的`author`对象：

| 字段              | 类型  | 内容         | 备注     |
|-----------------|-----|------------|--------|
| mid             | num | 字幕上传者mid   |        |
| name            | str | 字幕上传者昵称    |        |
| sex             | str | 字幕上传者性别    | 男 女 保密 |
| face            | str | 字幕上传者头像url |        |
| sign            | str | 字幕上传者签名    |        |
| rank            | num | 10000      | 作用尚不明确 |
| birthday        | num | 0          | 作用尚不明确 |
| is_fake_account | num | 0          | 作用尚不明确 |
| is_deleted      | num | 0          | 作用尚不明确 |

`ugc_season`对象：

| 字段         | 类型    | 内容      | 备注     |
|------------|-------|---------|--------|
| id       | num   | 视频合集id  |        |
| title       | str   | 视频合集标题 |        |
| mid       | str | 视频合集作者id |        |
| intro      | str   | 视频合集介绍  |        |
| sign_state      | num   | ？  |     作用尚不明确   |
| attribute       | num  | 稿件属性位       | 详情见[属性数据文档](attribute_data.md#attribute字段值(稿件属性位)) |
| sections  | array   | 视频合集中分部列表，名称可由up主自定义，默认为正片       |  |
| stat      | obj   | 视频合集状态数  |        |
| ep_count      | num   | 视频合集中视频数量  |        |
| season_type      | num   | 作用尚不明确  |        |
| is_pay_season      | bool   | 是否为付费合集  |        |
| enable_vt      | num   | 作用尚不明确  |        |

`ugc_season`中的`sections`数组：

| 字段         | 类型    | 内容      | 备注     |
|------------|-------|---------|--------|
| season_id       | num   | 视频合集中分部所属视频合集id  |        |
| section_id       | num   | 视频合集中分部id |        |
| title       | str | 视频合集中分部标题 |        |
| type       | num   | ？  |   作用尚不明确     |
| episodes       | array   | 视频合集中分部的视频列表 |        |

`sections`中的`episodes`数组：

| 字段         | 类型    | 内容      | 备注     |
|------------|-------|---------|--------|
| season_id       | num   | 视频合集中分部中视频所属视频合集id  |        |
| section_id       | num   | 视频合集中视频合集中分部中视频所属视频合集分部id |        |
| id       | num | 视频合集分部中视频id(以下简称视频) |        |
| aid       | num   | 视频aid  |        |
| cid       | num   | 视频cid |        |
| title       | str   | 视频标题 | 合集列表中展示的标题。默认视频真实标题，在[创作中心-合集管理-单集标题](https://member.bilibili.com/platform/upload-manager/ep)修改后则以修改后为准 |
| arc       | obj   | 视频详细信息 |   基本同「[获取视频详细信息(web端)](#获取视频详细信息(web端))」中的data对象     |

`ugc_season`中的`stat`对象：

|字段         | 类型    | 内容      | 备注     |
|------------|-------|---------|--------|
| season_id       | num   | 视频合集id  |        |
| view       | num   | 视频合集总浏览量 |        |
| danmaku       | num | 视频合集总弹幕量 |        |
| reply       | num   | 视频合集总评论量  |        |
| fav       | num   | 视频合集总收藏数  |        |
| coin       | num   | 视频合集总投币数  |        |
| share       | num   | 视频合集总分享数  |        |
| now_rank       | num   | 视频合集当前排名  |        |
| his_rank       | num   | 视频合集历史排名  |        |
| like       | num   | 视频合集总获赞数  |        |
| vt       | num   | 作用尚不明确  |        |
| vv       | num   | 作用尚不明确  |        |

`ugc_season`示例

```jsonc
            "ugc_season": {
                "id": 2974525,
                "title": "楚汉传奇",
                "cover": "https://archive.biliimg.com/bfs/archive/5a853e8bd10a041360b45a462785d90a58ec469e.png",
                "mid": 1557073149,
                "intro": "",
                "sign_state": 0,
                "attribute": 140,
                "sections": [
                    {
                        "season_id": 2974525,
                        "id": 3341804,
                        "title": "正片",
                        "type": 1,
                        "episodes": [
                            {
                                "season_id": 2974525,
                                "section_id": 3341804,
                                "id": 64976947,
                                "aid": 1804383120,
                                "cid": 1541093346,
                                "title": "项燕的10万大军惨败秦国，临死前，立下狠誓“楚虽三户，亡秦必楚”",
                                "attribute": 0,
                                "arc": {
                                    "aid": 1804383120,
                                    "videos": 0,
                                    "type_id": 0,
                                    "type_name": "",
                                    "copyright": 0,
                                    "pic": "http://i1.hdslb.com/bfs/archive/9d0ebd0a8abd7b005466cb57632ddaa550d24dab.jpg",
                                    "title": "项燕的10万大军惨败秦国，临死前，立下狠誓“楚虽三户，亡秦必楚”",
                                    "pubdate": 1715427472,
                                    "ctime": 1715427472,
                                    "desc": "",
                                    "state": 0,
                                    "duration": 612,
                                    "rights": {
                                        "bp": 0,
                                        "elec": 0,
                                        "download": 0,
                                        "movie": 0,
                                        "pay": 0,
                                        "hd5": 0,
                                        "no_reprint": 0,
                                        "autoplay": 0,
                                        "ugc_pay": 0,
                                        "is_cooperation": 0,
                                        "ugc_pay_preview": 0,
                                        "arc_pay": 0,
                                        "free_watch": 0
                                    },
                                    "author": {
                                        "mid": 0,
                                        "name": "",
                                        "face": ""
                                    },
                                    "stat": {
                                        "aid": 1804383120,
                                        "view": 787330,
                                        "danmaku": 1298,
                                        "reply": 774,
                                        "fav": 2589,
                                        "coin": 1947,
                                        "share": 271,
                                        "now_rank": 0,
                                        "his_rank": 0,
                                        "like": 12320,
                                        "dislike": 0,
                                        "evaluation": "",
                                        "argue_msg": "",
                                        "vt": 2630119,
                                        "vv": 787330
                                    },
                                    "dynamic": "",
                                    "dimension": {
                                        "width": 0,
                                        "height": 0,
                                        "rotate": 0
                                    },
                                    "desc_v2": null,
                                    "is_chargeable_season": false,
                                    "is_blooper": false,
                                    "enable_vt": 0,
                                    "vt_display": ""
                                },
                                "page": {
                                    "cid": 1541093346,
                                    "page": 1,
                                    "from": "vupload",
                                    "part": "项燕的10万大军惨败秦国，临死前，立下狠誓“楚虽三户，亡秦必楚”",
                                    "duration": 612,
                                    "vid": "",
                                    "weblink": "",
                                    "dimension": {
                                        "width": 1920,
                                        "height": 1080,
                                        "rotate": 0
                                    }
                                },
                                "bvid": "BV1Tb421b7mi",
                                "pages": [
                                    {
                                        "cid": 1541093346,
                                        "page": 1,
                                        "from": "vupload",
                                        "part": "项燕的10万大军惨败秦国，临死前，立下狠誓“楚虽三户，亡秦必楚”",
                                        "duration": 612,
                                        "vid": "",
                                        "weblink": "",
                                        "dimension": {
                                            "width": 1920,
                                            "height": 1080,
                                            "rotate": 0
                                        }
                                    }
                                ]
                            },
                            {
                                "season_id": 2974525,
                                "section_id": 3341804,
                                "id": 65121012,
                                "aid": 1004394994,
                                "cid": 1542426326,
                                "title": "卢绾斗鸡输了，眼看十个手指头保不住，刘邦倾家荡产帮了他",
                                "attribute": 0,
                                "arc": {
                                  ///
                                }
                            }
                        ]
                    }
                ],
                "stat": {
                "season_id": 3617611,
                "view": 1826438,
                "danmaku": 5193,
                "reply": 3036,
                "fav": 5970,
                "coin": 2303,
                "share": 663,
                "now_rank": 0,
                "his_rank": 0,
                "like": 40848,
                "vt": 0,
                "vv": 0
            },
            "ep_count": 21,
            "season_type": 1,
            "is_pay_season": false,
            "enable_vt": 0

            }
```

`staff`数组：

| 项   | 类型  | 内容        | 备注  |
|-----|-----|-----------|-----|
| 0   | obj | 合作成员1     |     |
| n   | obj | 合作成员(n+1) |     |
| ……  | obj | ……        | ……  |

`staff`数组中的对象：

| 字段       | 类型  | 内容      | 备注  |
|----------|-----|---------|-----|
| mid      | num | 成员mid   |     |
| title    | str | 成员名称    |     |
| name     | str | 成员昵称    |     |
| face     | str | 成员头像url |     |
| vip      | obj | 成员大会员状态 |     |
| official | obj | 成员认证信息  |     |
| follower | num | 成员粉丝数   |     |
| label_style | num |     |     |

`staff`数组中的对象中的`vip`对象：

| 字段         | 类型  | 内容     | 备注                        |
|------------|-----|--------|---------------------------|
| type       | num | 成员会员类型 | 0：无<br />1：月会员<br />2：年会员 |
| status     | num | 会员状态   | 0：无<br />1：有              |
| due_date   | num | 到期时间   | UNIX 毫秒时间戳               |
| vip_pay_type | num |           |                             |
| theme_type | num | 0      |                           |
| label      | obj |           |                             |

`staff`数组中的对象中的`official`对象：

| 字段    | 类型  | 内容     | 备注                                    |
|-------|-----|--------|---------------------------------------|
| role  | num | 成员认证级别 | 见[用户认证类型一览](../user/official_role.md) |
| title | str | 成员认证名  | 无为空                                   |
| desc  | str | 成员认证备注 | 无为空                                   |
| type  | num | 成员认证类型 | -1：无<br />0：有                         |

`data`中的`user_garb`对象：

| 字段                | 类型  | 内容    | 备注  |
|-------------------|-----|-------|-----|
| url_image_ani_cut | str | 某url？ |     |

`data`中的`honor_reply`对象：

| 字段    | 类型    | 内容  | 备注  |
|-------|-------|-----|-----|
| honor | array |     |     |

`honor`数组中的对象：

| 字段                   | 类型  | 内容                                  | 备注  |
|----------------------|-----|-------------------------------------|-----|
| aid                  | num | 当前稿件aid                             |     |
| type                 | num | 1：入站必刷收录<br/>2：第?期每周必看<br/>3：全站排行榜最高第?名<br/>4：热门 |     |
| desc                 | num | 描述                                  |     |
| weekly_recommend_num | num |                                     |     |

**示例：**

获取视频`av85440373`/`BV117411r7R1`的基本信息

avid方式：

```shell
curl -G 'https://api.bilibili.com/x/web-interface/view' \
--data-urlencode 'aid=85440373'
```

bvid方式：

```shell
curl -G 'https://api.bilibili.com/x/web-interface/view' \
--data-urlencode 'bvid=BV117411r7R1'
```

<details>
<summary>查看响应示例：</summary>

```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "bvid": "BV117411r7R1",
    "aid": 85440373,
    "videos": 1,
    "tid": 28,
    "tid_v2": 2061,
    "tname": "原创音乐",
    "tname_v2": "人力VOCALOID",
    "copyright": 1,
    "pic": "http://i1.hdslb.com/bfs/archive/ea0dd34bf41e23a68175680a00e3358cd249105f.jpg",
    "title": "当我给拜年祭的快板加了电音配乐…",
    "pubdate": 1580377255,
    "ctime": 1580212263,
    "desc": "【CB想说的】看完拜年祭之后最爱的一个节目！给有快板的部分简单加了一些不同风格的配乐hhh，感谢沃玛画的我！太可爱了哈哈哈哈哈哈哈！！！\n【Warma想说的】我画了打碟的CB，画风为了还原原版视频所以参考了四迹老师的画风，四迹老师的画真的太可爱啦！不过其实在画的过程中我遇到了一个问题，CB的耳机……到底是戴在哪个耳朵上呢？\n\n原版：av78977080\n编曲（配乐）：Crazy Bucket\n人声（配音）：Warma/谢拉\n曲绘：四迹/Warma\n动画：四迹/Crazy Bucket\n剧本：Mokurei-木灵君\n音频后期：DMYoung/纳兰寻风/Crazy Bucket\n包装：破晓天",
    "desc_v2": [
      {
        "raw_text": "【CB想说的】看完拜年祭之后最爱的一个节目！给有快板的部分简单加了一些不同风格的配乐hhh，感谢沃玛画的我！太可爱了哈哈哈哈哈哈哈！！！\n【Warma想说的】我画了打碟的CB，画风为了还原原版视频所以参考了四迹老师的画风，四迹老师的画真的太可爱啦！不过其实在画的过程中我遇到了一个问题，CB的耳机……到底是戴在哪个耳朵上呢？\n\n原版：av78977080\n编曲（配乐）：Crazy Bucket\n人声（配音）：Warma/谢拉\n曲绘：四迹/Warma\n动画：四迹/Crazy Bucket\n剧本：Mokurei-木灵君\n音频后期：DMYoung/纳兰寻风/Crazy Bucket\n包装：破晓天",
        "type": 1,
        "biz_id": 0
      }
    ],
    "state": 0,
    "duration": 486,
    "mission_id": 11838,
    "rights": {
      "bp": 0,
      "elec": 0,
      "download": 1,
      "movie": 0,
      "pay": 0,
      "hd5": 1,
      "no_reprint": 1,
      "autoplay": 1,
      "ugc_pay": 0,
      "is_cooperation": 1,
      "ugc_pay_preview": 0,
      "no_background": 0,
      "clean_mode": 0,
      "is_stein_gate": 0,
      "is_360": 0,
      "no_share": 0,
      "arc_pay": 0,
      "free_watch": 0
    },
    "owner": {
      "mid": 66606350,
      "name": "陈楒潼桶桶桶",
      "face": "https://i2.hdslb.com/bfs/face/c9af3b32cf74baec5a4b65af8ca18ae5ff571f77.jpg"
    },
    "stat": {
      "aid": 85440373,
      "view": 2404179,
      "danmaku": 12348,
      "reply": 2676,
      "favorite": 58329,
      "coin": 72793,
      "share": 9620,
      "now_rank": 0,
      "his_rank": 55,
      "like": 161270,
      "dislike": 0,
      "evaluation": "",
      "vt": 0
    },
    "argue_info": {
      "argue_msg": "",
      "argue_type": 0,
      "argue_link": ""
    },
    "dynamic": "进来就出不去了！！！\n#全民音乐UP主##CB##warma##电音##快板##拜年祭##诸神的奥运##编曲##Remix#",
    "cid": 146044693,
    "dimension": {
      "width": 1920,
      "height": 1080,
      "rotate": 0
    },
    "premiere": null,
    "teenage_mode": 0,
    "is_chargeable_season": false,
    "is_story": false,
    "is_upower_exclusive": false,
    "is_upower_play": false,
    "is_upower_preview": false,
    "enable_vt": 0,
    "vt_display": "",
    "is_upower_exclusive_with_qa": false,
    "no_cache": false,
    "pages": [
      {
        "cid": 146044693,
        "page": 1,
        "from": "vupload",
        "part": "建议改成：建议改成：诸 神 的 电 音 节（不是）",
        "duration": 486,
        "vid": "",
        "weblink": "",
        "dimension": {
          "width": 1920,
          "height": 1080,
          "rotate": 0
        },
        "ctime": 1580212263
      }
    ],
    "subtitle": {
      "allow_submit": false,
      "list": [
        {
          "id": 1061981378473779968,
          "lan": "ai-zh",
          "lan_doc": "中文（自动生成）",
          "is_lock": false,
          "subtitle_url": "",
          "type": 1,
          "id_str": "1061981378473779968",
          "ai_type": 0,
          "ai_status": 2,
          "author": {
            "mid": 0,
            "name": "",
            "sex": "",
            "face": "",
            "sign": "",
            "rank": 0,
            "birthday": 0,
            "is_fake_account": 0,
            "is_deleted": 0,
            "in_reg_audit": 0,
            "is_senior_member": 0,
            "name_render": null
          }
        }
      ]
    },
    "staff": [
      {
        "mid": 66606350,
        "title": "UP主",
        "name": "陈楒潼桶桶桶",
        "face": "https://i2.hdslb.com/bfs/face/c9af3b32cf74baec5a4b65af8ca18ae5ff571f77.jpg",
        "vip": {
          "type": 2,
          "status": 1,
          "due_date": 1769443200000,
          "vip_pay_type": 1,
          "theme_type": 0,
          "label": {
            "path": "",
            "text": "年度大会员",
            "label_theme": "annual_vip",
            "text_color": "#FFFFFF",
            "bg_style": 1,
            "bg_color": "#FB7299",
            "border_color": "",
            "use_img_label": true,
            "img_label_uri_hans": "",
            "img_label_uri_hant": "",
            "img_label_uri_hans_static": "https://i0.hdslb.com/bfs/vip/8d4f8bfc713826a5412a0a27eaaac4d6b9ede1d9.png",
            "img_label_uri_hant_static": "https://i0.hdslb.com/bfs/activity-plat/static/20220614/e369244d0b14644f5e1a06431e22a4d5/VEW8fCC0hg.png"
          },
          "avatar_subscript": 1,
          "nickname_color": "#FB7299",
          "role": 3,
          "avatar_subscript_url": "",
          "tv_vip_status": 0,
          "tv_vip_pay_type": 0,
          "tv_due_date": 0,
          "avatar_icon": {
            "icon_type": 1,
            "icon_resource": {}
          }
        },
        "official": {
          "role": 1,
          "title": "bilibili 知名音乐UP主",
          "desc": "",
          "type": 0
        },
        "follower": 616428,
        "label_style": 0
      },
      {
        "mid": 53456,
        "title": "曲绘",
        "name": "Warma",
        "face": "https://i2.hdslb.com/bfs/face/87c0b7e4d3eedf04c458a82b9271013beaa4bc59.jpg",
        "vip": {
          "type": 2,
          "status": 1,
          "due_date": 1770480000000,
          "vip_pay_type": 0,
          "theme_type": 0,
          "label": {
            "path": "",
            "text": "年度大会员",
            "label_theme": "annual_vip",
            "text_color": "#FFFFFF",
            "bg_style": 1,
            "bg_color": "#FB7299",
            "border_color": "",
            "use_img_label": true,
            "img_label_uri_hans": "https://i0.hdslb.com/bfs/activity-plat/static/20220608/e369244d0b14644f5e1a06431e22a4d5/0DFy9BHgwE.gif",
            "img_label_uri_hant": "",
            "img_label_uri_hans_static": "https://i0.hdslb.com/bfs/vip/8d7e624d13d3e134251e4174a7318c19a8edbd71.png",
            "img_label_uri_hant_static": "https://i0.hdslb.com/bfs/activity-plat/static/20220614/e369244d0b14644f5e1a06431e22a4d5/uckjAv3Npy.png"
          },
          "avatar_subscript": 1,
          "nickname_color": "#FB7299",
          "role": 3,
          "avatar_subscript_url": "",
          "tv_vip_status": 1,
          "tv_vip_pay_type": 1,
          "tv_due_date": 1753286400,
          "avatar_icon": {
            "icon_type": 1,
            "icon_resource": {}
          }
        },
        "official": {
          "role": 1,
          "title": "bilibili 知名UP主",
          "desc": "",
          "type": 0
        },
        "follower": 4818052,
        "label_style": 0
      }
    ],
    "is_season_display": false,
    "user_garb": {
      "url_image_ani_cut": "https://i0.hdslb.com/bfs/garb/item/e4c1c34e8b87fc05a893ed4a04ad322f75edbed9.bin"
    },
    "honor_reply": {
      "honor": [
        {
          "aid": 85440373,
          "type": 2,
          "desc": "第45期每周必看",
          "weekly_recommend_num": 45
        },
        {
          "aid": 85440373,
          "type": 3,
          "desc": "全站排行榜最高第55名",
          "weekly_recommend_num": 0
        },
        {
          "aid": 85440373,
          "type": 4,
          "desc": "热门",
          "weekly_recommend_num": 0
        },
        {
          "aid": 85440373,
          "type": 7,
          "desc": "热门收录",
          "weekly_recommend_num": 0
        }
      ]
    },
    "like_icon": "",
    "need_jump_bv": false,
    "disable_show_up_info": false,
    "is_story_play": 1,
    "is_view_self": false
  }
}
```

</details>

视频标题为：`当我给拜年祭的快板加了电音配乐…`

视频分区为：`tid=28(音乐->原创音乐)`

视频时长：`486s`

视频发布时间：`2020/1/30 17:40:55`

视频投稿时间：`2020/1/28 19:51:3`

视频分P为：`1`

视频类型为：`1(原创)`

视频UP主为：`66606350(Crazy_Bucket_陈楒潼)`

视频简介为：

`【CB想说的】看完拜年祭之后最爱的一个节目！给有快板的部分简单加了一些不同风格的配乐hhh，感谢沃玛画的我！太可爱了哈哈哈哈哈哈哈！！！\n【Warma想说的】我画了打碟的CB，画风为了还原原版视频所以参考了四迹老师的画风，四迹老师的画真的太可爱啦！不过其实在画的过程中我遇到了一个问题，CB的耳机……到底是戴在哪个耳朵上呢？\n\n原版：av78977080\n编曲(配乐)：Crazy Bucket\n人声(配音)：Warma/谢拉\n曲绘：四迹/Warma\n动画：四迹/Crazy Bucket\n剧本：Mokurei-木灵君\n音频后期：DMYoung/纳兰寻风/Crazy Bucket\n包装：破晓天`

视频状态为：`0(开放浏览)`

视频属性为： `显示“禁止转载“标志`、`高清`、`禁止其他人添加TAG`、`联合投稿视频`

视频封面为：

https://i1.hdslb.com/bfs/archive/ea0dd34bf41e23a68175680a00e3358cd249105f.jpg

<img src="https://i1.hdslb.com/bfs/archive/ea0dd34bf41e23a68175680a00e3358cd249105f.jpg" referrerpolicy="no-referrer" />

## 获取视频超详细信息(web端)

> https://api.bilibili.com/x/web-interface/view/detail

> https://api.bilibili.com/x/web-interface/wbi/view/detail

*请求方式：GET*

认证方式：Cookie(SESSDATA)

鉴权方式：[Wbi 签名](../misc/sign/wbi.md)

限制游客访问的视频需要登录

**url参数：**

| 参数名    | 类型 | 内容                 | 必要性     | 备注               |
| --------- | ---- | -------------------- | ---------- | ------------------ |
| aid       | num  | 稿件avid             | 必要(可选) | avid与bvid任选一个 |
| bvid      | str  | 稿件bvid             | 必要(可选) | avid与bvid任选一个 |
| need_elec | num  | 是否获取UP主充电信息 | 非必要     | 0：否<br />1：是   |

**json回复：**

根对象：

| 字段    | 类型 | 内容     | 备注                                                                                 |
| ------- | ---- | -------- | ------------------------------------------------------------------------------------ |
| code    | num  | 返回值   | 0：成功<br />-400：请求错误<br />-403：权限不足<br />-404：无视频<br />62002：稿件不可见<br />62004：稿件审核中<br />62012：仅UP主自己可见 |
| message | str  | 错误信息 | 默认为0                                                                              |
| ttl     | num  | 1        |                                                                                      |
| data    | obj  | 信息本体 |                                                                                      |

`data`对象：

| 字段              | 类型  | 内容             | 备注         |
| ----------------- | ----- | ---------------- | ------------ |
| View              | obj   | 视频基本信息     |              |
| Card              | obj   | 视频UP主信息     |              |
| Tags              | array | 视频TAG信息      |              |
| Reply             | obj   | 视频热评信息     |              |
| Related           | array | 推荐视频信息     |              |
| Spec              | null  | ？               | 作用尚不明确 |
| hot_share         | obj   | ？               | 作用尚不明确 |
| elec              | 有效时：obj<br />无效时：null | 充电信息         | 当请求参数 `need_elec=1` 且有充电信息时有效 |
| recommend         | null  | ？               | 作用尚不明确 |
| emergency         | obj   | 视频操作按钮信息 |              |
| view_addit        | obj   | ？               | 作用尚不明确 |
| guide             | null  | ？               | 作用尚不明确 |
| query_tags        | null  | ？               | 作用尚不明确 |
| participle        | array | 分词信息         | 用于推荐     |
| module_ctrl       | null  | ？               | 作用尚不明确 |
| replace_recommend | bool  | ？               | 作用尚不明确 |

`data`中的`View`对象：

基本同「[获取视频详细信息(web端)](#获取视频详细信息web端)」中的data对象

`data`中的`Card`对象：

基本同「[用户名片信息](../user/info.md#用户名片信息)」中的data对象

`data`中的`Tags`数组：

基本同「[获取视频TAG信息（新）](tags.md#获取视频TAG信息新)」中的data数组

`data`中的`Reply`对象：

基本同「[获取评论区热评](../comment/list.md#获取评论区热评)」中的data对象

`data`中的`Related`数组：

| 项   | 类型  | 内容        | 备注  |
|-----|-----|-----------|-----|
| 0   | obj | 推荐视频1     |     |
| n   | obj | 推荐视频(n+1) |     |
| ……  | obj | ……        | ……  |

`Related`数组中的对象：

基本同「[获取视频详细信息(web端)](#获取视频详细信息web端)」中的data对象，已知部分字段有差异，如没有分P信息

`data`中的`hot_share`对象：

| 字段   | 类型    | 内容    | 备注     |
|------|-------|-------|--------|
| show | bool  | false | 作用尚不明确 |
| list | array | 空     | 作用尚不明确 |

`data`中的`elec`对象：

基本同「[获取视频充电鸣谢名单](../electric/charge_list.md#获取视频充电鸣谢名单)」中的data对象

`data`中的`emergency`对象：

| 字段     | 类型 | 内容               | 备注     |
| -------- | ---- | ------------------ | -------- |
| no_like  | bool | 是否不显示点赞按钮 |          |
| no_coin  | bool | 是否不显示投币按钮 |          |
| no_fav   | bool | 是否不显示收藏按钮 |          |
| no_share | bool | 是否不显示分享按钮 |          |

`data`中的`view_addit`对象：

| 字段 | 类型 | 内容                 | 备注         |
| ---- | ---- | -------------------- | ------------ |
| 63   | bool | 是否不显示直播推荐   |              |
| 64   | bool | 是否不显示活动推荐   |              |
| 69   | bool | ？                   | 作用尚不明确 |
| 71   | bool | 是否不显示标签与笔记 |              |
| 72   | bool | ？                   | 作用尚不明确 |

**示例：**

获取视频`av170001`/`BV17x411w7KC`的详细信息

avid方式：

```shell
curl -G 'https://api.bilibili.com/x/web-interface/view/detail' \
--data-urlencode 'aid=170001' \
--data-urlencode 'need_elec=1'
```

bvid方式：

```shell
curl -G 'https://api.bilibili.com/x/web-interface/view/detail' \
--data-urlencode 'bvid=BV17x411w7KC' \
--data-urlencode 'need_elec=1'
```

<details>
<summary>查看响应示例：</summary>

```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "View": {
      "bvid": "BV17x411w7KC",
      "aid": 170001,
      "videos": 10,
      "tid": 193,
      "tid_v2": 2017,
      "tname": "MV",
      "tname_v2": "MV",
      "copyright": 2,
      "pic": "http://i2.hdslb.com/bfs/archive/1ada8c32a9d168e4b2ee3e010f24789ba3353785.jpg",
      "title": "【MV】保加利亚妖王AZIS视频合辑",
      "pubdate": 1320850533,
      "ctime": 1497380562,
      "desc": "sina 保加利亚超级天王 Azis1999年出道。他的音乐融合保加利亚名族曲风chalga和pop、rap等元素，不过他惊艳的易装秀与浮夸的角色诠释才是他最为出名的地方 Azis与众多保加利亚天王天后级歌手都有过合作.06年，他作为Mariana Popova的伴唱，在欧洲半决赛上演唱了他们的参赛曲Let Me Cry 06年他被Velikite Balgari评为保加利亚有史以来最伟大的名人之一",
      "desc_v2": [
        {
          "raw_text": "sina 保加利亚超级天王 Azis1999年出道。他的音乐融合保加利亚名族曲风chalga和pop、rap等元素，不过他惊艳的易装秀与浮夸的角色诠释才是他最为出名的地方 Azis与众多保加利亚天王天后级歌手都有过合作.06年，他作为Mariana Popova的伴唱，在欧洲半决赛上演唱了他们的参赛曲Let Me Cry 06年他被Velikite Balgari评为保加利亚有史以来最伟大的名人之一",
          "type": 1,
          "biz_id": 0
        }
      ],
      "state": 0,
      "duration": 2412,
      "rights": {
        "bp": 0,
        "elec": 0,
        "download": 1,
        "movie": 0,
        "pay": 0,
        "hd5": 0,
        "no_reprint": 0,
        "autoplay": 1,
        "ugc_pay": 0,
        "is_cooperation": 0,
        "ugc_pay_preview": 0,
        "no_background": 0,
        "clean_mode": 0,
        "is_stein_gate": 0,
        "is_360": 0,
        "no_share": 0,
        "arc_pay": 0,
        "free_watch": 0
      },
      "owner": {
        "mid": 122541,
        "name": "冰封.虾子",
        "face": "http://i0.hdslb.com/bfs/face/40c46ee74dd6ea33d46c38cd6083e6a1286aa482.gif"
      },
      "stat": {
        "aid": 170001,
        "view": 45252521,
        "danmaku": 914336,
        "reply": 184686,
        "favorite": 883733,
        "coin": 291585,
        "share": 12779204,
        "now_rank": 0,
        "his_rank": 13,
        "like": 928358,
        "dislike": 0,
        "evaluation": "",
        "vt": 0
      },
      "argue_info": {
        "argue_msg": "",
        "argue_type": 0,
        "argue_link": ""
      },
      "dynamic": "",
      "cid": 279786,
      "dimension": {
        "width": 512,
        "height": 288,
        "rotate": 0
      },
      "premiere": null,
      "teenage_mode": 0,
      "is_chargeable_season": false,
      "is_story": false,
      "is_upower_exclusive": false,
      "is_upower_play": false,
      "is_upower_preview": false,
      "enable_vt": 0,
      "vt_display": "",
      "is_upower_exclusive_with_qa": false,
      "no_cache": false,
      "pages": [
        {
          "cid": 279786,
          "page": 1,
          "from": "vupload",
          "part": "Хоп",
          "duration": 199,
          "vid": "",
          "weblink": "",
          "dimension": {
            "width": 512,
            "height": 288,
            "rotate": 0
          },
          "ctime": 1497380562
        },
        {
          "cid": 275431,
          "page": 2,
          "from": "vupload",
          "part": "Imash li surce",
          "duration": 205,
          "vid": "",
          "weblink": "",
          "dimension": {
            "width": 640,
            "height": 360,
            "rotate": 0
          },
          "ctime": 1497380562
        },
        {
          "cid": 279787,
          "page": 3,
          "from": "vupload",
          "part": "No Kazvam Ti Stiga",
          "duration": 308,
          "vid": "",
          "weblink": "",
          "dimension": {
            "width": 432,
            "height": 324,
            "rotate": 0
          },
          "ctime": 1497380562
        },
        {
          "cid": 280467,
          "page": 4,
          "from": "vupload",
          "part": "Samo za teb",
          "duration": 273,
          "vid": "",
          "weblink": "",
          "dimension": {
            "width": 360,
            "height": 288,
            "rotate": 0
          },
          "ctime": 1497380562
        },
        {
          "cid": 280468,
          "page": 5,
          "from": "vupload",
          "part": "Tochno sega",
          "duration": 241,
          "vid": "",
          "weblink": "",
          "dimension": {
            "width": 584,
            "height": 360,
            "rotate": 0
          },
          "ctime": 1497380562
        },
        {
          "cid": 280469,
          "page": 6,
          "from": "vupload",
          "part": "Kak boli",
          "duration": 336,
          "vid": "",
          "weblink": "",
          "dimension": {
            "width": 384,
            "height": 288,
            "rotate": 0
          },
          "ctime": 1497380562
        },
        {
          "cid": 274491,
          "page": 7,
          "from": "vupload",
          "part": "Obicham Te",
          "duration": 250,
          "vid": "",
          "weblink": "",
          "dimension": {
            "width": 402,
            "height": 208,
            "rotate": 0
          },
          "ctime": 1497380562
        },
        {
          "cid": 267410,
          "page": 8,
          "from": "vupload",
          "part": "Mrazish",
          "duration": 201,
          "vid": "",
          "weblink": "",
          "dimension": {
            "width": 540,
            "height": 360,
            "rotate": 0
          },
          "ctime": 1497380562
        },
        {
          "cid": 267714,
          "page": 9,
          "from": "vupload",
          "part": "Няма накъде",
          "duration": 201,
          "vid": "",
          "weblink": "",
          "dimension": {
            "width": 450,
            "height": 360,
            "rotate": 0
          },
          "ctime": 1497380562
        },
        {
          "cid": 270380,
          "page": 10,
          "from": "vupload",
          "part": "Gadna poroda",
          "duration": 198,
          "vid": "",
          "weblink": "",
          "dimension": {
            "width": 432,
            "height": 324,
            "rotate": 0
          },
          "ctime": 1497380562
        }
      ],
      "subtitle": {
        "allow_submit": false,
        "list": []
      },
      "is_season_display": false,
      "user_garb": {
        "url_image_ani_cut": "https://i0.hdslb.com/bfs/garb/item/e4c1c34e8b87fc05a893ed4a04ad322f75edbed9.bin"
      },
      "honor_reply": {
        "honor": [
          {
            "aid": 170001,
            "type": 3,
            "desc": "全站排行榜最高第13名",
            "weekly_recommend_num": 0
          }
        ]
      },
      "like_icon": "",
      "need_jump_bv": false,
      "disable_show_up_info": false,
      "is_story_play": 0,
      "is_view_self": false
    },
    "Card": {
      "card": {
        "mid": "122541",
        "name": "冰封.虾子",
        "approve": false,
        "sex": "保密",
        "rank": "10000",
        "face": "http://i0.hdslb.com/bfs/face/40c46ee74dd6ea33d46c38cd6083e6a1286aa482.gif",
        "face_nft": 0,
        "face_nft_type": 0,
        "DisplayRank": "0",
        "regtime": 0,
        "spacesta": 0,
        "birthday": "",
        "place": "",
        "description": "",
        "article": 0,
        "attentions": [],
        "fans": 64052,
        "friend": 45,
        "attention": 45,
        "sign": "路亚钓鱼爱好者交流群411267154",
        "level_info": {
          "current_level": 6,
          "current_min": 0,
          "current_exp": 0,
          "next_exp": 0
        },
        "pendant": {
          "pid": 0,
          "name": "",
          "image": "",
          "expire": 0,
          "image_enhance": "",
          "image_enhance_frame": "",
          "n_pid": 0
        },
        "nameplate": {
          "nid": 9,
          "name": "出道偶像",
          "image": "https://i0.hdslb.com/bfs/face/3f2d64f048b39fb6c26f3db39df47e6080ec0f9c.png",
          "image_small": "https://i0.hdslb.com/bfs/face/90c35d41d8a19b19474d6bac672394c17b444ce8.png",
          "level": "高级勋章",
          "condition": "所有自制视频总播放数>=50万"
        },
        "Official": {
          "role": 0,
          "title": "",
          "desc": "",
          "type": -1
        },
        "official_verify": {
          "type": -1,
          "desc": ""
        },
        "vip": {
          "type": 1,
          "status": 0,
          "due_date": 1493827200000,
          "vip_pay_type": 0,
          "theme_type": 0,
          "label": {
            "path": "",
            "text": "",
            "label_theme": "",
            "text_color": "",
            "bg_style": 0,
            "bg_color": "",
            "border_color": "",
            "use_img_label": true,
            "img_label_uri_hans": "",
            "img_label_uri_hant": "",
            "img_label_uri_hans_static": "https://i0.hdslb.com/bfs/vip/d7b702ef65a976b20ed854cbd04cb9e27341bb79.png",
            "img_label_uri_hant_static": "https://i0.hdslb.com/bfs/activity-plat/static/20220614/e369244d0b14644f5e1a06431e22a4d5/KJunwh19T5.png"
          },
          "avatar_subscript": 0,
          "nickname_color": "",
          "role": 0,
          "avatar_subscript_url": "",
          "tv_vip_status": 0,
          "tv_vip_pay_type": 0,
          "tv_due_date": 0,
          "avatar_icon": {
            "icon_resource": {}
          },
          "vipType": 1,
          "vipStatus": 0
        },
        "is_senior_member": 0,
        "name_render": null
      },
      "space": {
        "s_img": "http://i1.hdslb.com/bfs/activity-plat/static/LRjqHhi0wL.png",
        "l_img": "http://i1.hdslb.com/bfs/space/cb1c3ef50e22b6096fde67febe863494caefebad.png"
      },
      "following": false,
      "archive_count": 382,
      "article_count": 0,
      "follower": 64052,
      "like_num": 1048712
    },
    "Tags": [
      {
        "tag_id": 0,
        "tag_name": "发现《Hop》",
        "music_id": "MA407124762800730394",
        "tag_type": "bgm",
        "jump_url": "https://music.bilibili.com/h5/music-detail?music_id=MA407124762800730394&cid=279786&aid=170001&na_close_hide=1"
      },
      {
        "tag_id": 117552,
        "tag_name": "保加利亚妖王",
        "music_id": "",
        "tag_type": "old_channel",
        "jump_url": ""
      },
      {
        "tag_id": 112503,
        "tag_name": "保加利亚",
        "music_id": "",
        "tag_type": "old_channel",
        "jump_url": ""
      },
      {
        "tag_id": 2958988,
        "tag_name": "Азис",
        "music_id": "",
        "tag_type": "old_channel",
        "jump_url": ""
      },
      {
        "tag_id": 2622213,
        "tag_name": "azis",
        "music_id": "",
        "tag_type": "old_channel",
        "jump_url": ""
      },
      {
        "tag_id": 2512079,
        "tag_name": "mv",
        "music_id": "",
        "tag_type": "old_channel",
        "jump_url": ""
      }
    ],
    "Reply": {
      "page": null,
      "replies": [
        {
          "rpid": 1,
          "oid": 0,
          "type": 0,
          "mid": 0,
          "root": 0,
          "parent": 0,
          "dialog": 0,
          "count": 0,
          "rcount": 0,
          "state": 0,
          "fansgrade": 0,
          "attr": 0,
          "ctime": 0,
          "like": 0,
          "action": 0,
          "content": null,
          "replies": null,
          "assist": 0,
          "show_follow": false
        }
      ]
    },
    "Related": [
      {
        "aid": 1252180876,
        "videos": 1,
        "tid": 130,
        "tname": "音乐综合",
        "copyright": 2,
        "pic": "http://i2.hdslb.com/bfs/archive/5a4eef19e38a3fa27f9db53cc45e7233e714ae03.jpg",
        "title": "Ricardo Milos - Dancin song [1080p]",
        "pubdate": 1711002767,
        "ctime": 1711002768,
        "desc": "https://www.youtube.com/watch?v=e9ASqhs9770",
        "state": 0,
        "duration": 259,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 477132,
          "name": "TAKERA",
          "face": "https://i0.hdslb.com/bfs/face/5af8b319889ba7a7d20ac59edb8464d65f43c1e1.gif"
        },
        "stat": {
          "aid": 1252180876,
          "view": 1590321,
          "danmaku": 2766,
          "reply": 2405,
          "favorite": 58654,
          "coin": 13468,
          "share": 15966,
          "now_rank": 0,
          "his_rank": 0,
          "like": 144640,
          "dislike": 0,
          "vt": 0,
          "vv": 1590321,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 1483741030,
        "dimension": {
          "width": 1920,
          "height": 1080,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1hJ4m177RN",
        "first_frame": "http://i0.hdslb.com/bfs/storyff/n240327ad1t4c11o1bbzfc2bkvg5fkuc_firsti.jpg",
        "pub_location": "中国香港",
        "cover43": "",
        "tidv2": 2036,
        "tnamev2": "舞蹈综合",
        "pid_v2": 1004,
        "pid_name_v2": "舞蹈",
        "bvid": "BV1hJ4m177RN",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 1252180876,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 80433022,
        "videos": 1,
        "tid": 193,
        "tname": "MV",
        "copyright": 1,
        "pic": "http://i1.hdslb.com/bfs/archive/5242750857121e05146d5d5b13a47a2a6dd36e98.jpg",
        "title": "【官方 MV】Never Gonna Give You Up - Rick Astley",
        "pubdate": 1577835803,
        "ctime": 1577835803,
        "desc": "-",
        "state": 0,
        "duration": 213,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 1,
          "no_reprint": 0,
          "autoplay": 0,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 1,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 486906719,
          "name": "索尼音乐中国",
          "face": "https://i2.hdslb.com/bfs/face/6bc95d0670863d36bf9167a37b825c39ce258506.jpg"
        },
        "stat": {
          "aid": 80433022,
          "view": 91790223,
          "danmaku": 128050,
          "reply": 170137,
          "favorite": 1286326,
          "coin": 1061915,
          "share": 396054,
          "now_rank": 0,
          "his_rank": 0,
          "like": 2464595,
          "dislike": 0,
          "vt": 0,
          "vv": 91790223,
          "fav_g": 10,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 137649199,
        "dimension": {
          "width": 1920,
          "height": 1080,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1GJ411x7h7",
        "up_from_v2": 15,
        "pub_location": "未知",
        "cover43": "",
        "tidv2": 2017,
        "tnamev2": "MV",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1GJ411x7h7",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 80433022,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 718913090,
        "videos": 1,
        "tid": 27,
        "tname": "综合",
        "copyright": 1,
        "pic": "http://i2.hdslb.com/bfs/archive/6567760d676268e2bf2e2c57486085a31427ed79.jpg",
        "title": "【咩栗】镇 站 之 宝",
        "pubdate": 1636448401,
        "ctime": 1636448403,
        "desc": "可以关注一下可爱的小羊和小狼呀～\n小羊主页：https://space.bilibili.com/745493\n小狼主页：https://space.bilibili.com/617459493\n⚡️☀️\n微博@电击咩阿栗\n微博@呜米嗷呜\n⚡️☀️\n网易云@咩栗\n网易云@呜米",
        "state": 0,
        "duration": 188,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 1,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 674421433,
          "name": "呜米咩栗的草原日常",
          "face": "https://i1.hdslb.com/bfs/face/5566e3a4786959527a72545f908b5664693a2945.jpg"
        },
        "stat": {
          "aid": 718913090,
          "view": 315224,
          "danmaku": 195,
          "reply": 462,
          "favorite": 2897,
          "coin": 702,
          "share": 202,
          "now_rank": 0,
          "his_rank": 0,
          "like": 15615,
          "dislike": 0,
          "vt": 0,
          "vv": 315224,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "咩栗，不可以。",
        "cid": 436835160,
        "dimension": {
          "width": 1920,
          "height": 1080,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV14Q4y1S7HU",
        "first_frame": "http://i0.hdslb.com/bfs/storyff/n211105a23d8ue6bh0m1ed1cu6yztac5_firsti.jpg",
        "cover43": "",
        "tidv2": 2047,
        "tnamev2": "虚拟UP主",
        "pid_v2": 1005,
        "pid_name_v2": "二次元",
        "bvid": "BV14Q4y1S7HU",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 718913090,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 895258574,
        "videos": 2,
        "tid": 130,
        "tname": "音乐综合",
        "copyright": 2,
        "pic": "http://i2.hdslb.com/bfs/archive/b94b8be43cd0a9a12bf1a334541b017a3bd24cb6.jpg",
        "title": "【全弹幕】av10388 武器A",
        "pubdate": 1648906567,
        "ctime": 1648906567,
        "desc": "sm9307581\n武器A\n[日常]UP主：博丽·灵梦（UID：13308）\n播放:1605344 | 收藏:20926 | 弹幕:42522\n投稿时间：2010/06/20 10:13\n啊哈哈哈，啊哈哈，啊哈，啊……总之就是武器……",
        "state": 0,
        "duration": 144,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 104657830,
          "name": "尚宜鼎MEMZ",
          "face": "https://i1.hdslb.com/bfs/face/6761798442c6e9607c62803ac4fa5fe4a3e7b25b.jpg"
        },
        "stat": {
          "aid": 895258574,
          "view": 3769820,
          "danmaku": 22377,
          "reply": 2776,
          "favorite": 12271,
          "coin": 484,
          "share": 3748,
          "now_rank": 0,
          "his_rank": 0,
          "like": 47622,
          "dislike": 0,
          "vt": 0,
          "vv": 3769820,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 1491314436,
        "dimension": {
          "width": 2848,
          "height": 1600,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1NP4y1K7Ze",
        "first_frame": "http://i0.hdslb.com/bfs/storyff/n240402sa2muwqb7q7sbvedoskth1279_firsti.jpg",
        "pub_location": "广东",
        "cover43": "",
        "tidv2": 2041,
        "tnamev2": "动漫剪辑",
        "pid_v2": 1005,
        "pid_name_v2": "二次元",
        "bvid": "BV1NP4y1K7Ze",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 895258574,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 56927206,
        "videos": 1,
        "tid": 138,
        "tname": "搞笑",
        "copyright": 2,
        "pic": "http://i2.hdslb.com/bfs/archive/fd8324a72f0c6629f6d9b6af0daa11d950863993.jpg",
        "title": "【每天一遍，网抑再见】万恶之源，抖就完事了",
        "pubdate": 1561555314,
        "ctime": 1561555314,
        "desc": "【带字幕版】本人亲自翻译\nBGM：coincidance \n有些人看着看着就抖起来了，别说了，护士姐姐真漂亮\nhttps://www.youtube.com/watch?v=nBHkIWAJitg&feature=share\n肩膀好了，就来摇头吧\nav65659850",
        "state": 0,
        "duration": 139,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 34232005,
          "name": "200斤的五条艾",
          "face": "https://i1.hdslb.com/bfs/face/5135289ba858105ae466429ba9610e7980cf73f0.jpg"
        },
        "stat": {
          "aid": 56927206,
          "view": 43534329,
          "danmaku": 77687,
          "reply": 19894,
          "favorite": 1584517,
          "coin": 721148,
          "share": 563420,
          "now_rank": 0,
          "his_rank": 15,
          "like": 2118557,
          "dislike": 0,
          "vt": 0,
          "vv": 43534329,
          "fav_g": 3,
          "like_g": 0
        },
        "dynamic": "#沙雕##搞笑视频##魔性#",
        "cid": 99428737,
        "dimension": {
          "width": 960,
          "height": 720,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1Ax411d7jD",
        "up_from_v2": 11,
        "cover43": "",
        "tidv2": 2059,
        "tnamev2": "鬼畜调教",
        "pid_v2": 1007,
        "pid_name_v2": "鬼畜",
        "bvid": "BV1Ax411d7jD",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 56927206,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 3643130,
        "videos": 1,
        "tid": 138,
        "tname": "搞笑",
        "copyright": 2,
        "pic": "http://i1.hdslb.com/bfs/archive/bc23ac6f17c82700d5c1941e0991bc8a6fcbd46c.png",
        "title": "金坷垃原版",
        "pubdate": 1453518942,
        "ctime": 1497431869,
        "desc": "http://v.youku.com/v_show/id_XNTkzMDUxNzI0.html?from=y1.2-1-102.3.1-1.1-1-1-0-0#paction 给知道金坷垃的孩子们补补课",
        "state": 0,
        "duration": 101,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 11374676,
          "name": "LX秦先生",
          "face": "https://i2.hdslb.com/bfs/face/90a808cdd9414d5f53e04d85b8929333eb61f474.jpg"
        },
        "stat": {
          "aid": 3643130,
          "view": 11110768,
          "danmaku": 29385,
          "reply": 7168,
          "favorite": 287656,
          "coin": 61435,
          "share": 190334,
          "now_rank": 0,
          "his_rank": 0,
          "like": 379164,
          "dislike": 0,
          "vt": 0,
          "vv": 11110768,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 5827830,
        "dimension": {
          "width": 640,
          "height": 354,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1Rs411R7Hi",
        "cover43": "",
        "tidv2": 2059,
        "tnamev2": "鬼畜调教",
        "pid_v2": 1007,
        "pid_name_v2": "鬼畜",
        "bvid": "BV1Rs411R7Hi",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 3643130,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 1601123876,
        "videos": 1,
        "tid": 130,
        "tname": "音乐综合",
        "copyright": 1,
        "pic": "http://i0.hdslb.com/bfs/archive/bc7442c6c54ef573ebe0455104ad87703703fad5.jpg",
        "title": "「保加利亚妖王」Hop - Azis 阿吉斯 百万级装备试听【Hi-Res】",
        "pubdate": 1709023713,
        "ctime": 1709023713,
        "desc": "作词 : Azis\n作曲 : Azis\n\n\n\n音响：天朗皇家西敏寺\n功放：麦景图 \n录音MIC：纽曼149 \n录音设备：SSL+ Protools",
        "state": 0,
        "duration": 189,
        "mission_id": 4009709,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 1,
          "no_reprint": 1,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 440121192,
          "name": "JLRS日落fm",
          "face": "https://i0.hdslb.com/bfs/face/008f2cf802f48e1d7f837887a3cefd95b918a0e5.jpg"
        },
        "stat": {
          "aid": 1601123876,
          "view": 549485,
          "danmaku": 1576,
          "reply": 1569,
          "favorite": 7872,
          "coin": 5056,
          "share": 4117,
          "now_rank": 0,
          "his_rank": 0,
          "like": 22458,
          "dislike": 0,
          "vt": 0,
          "vv": 549485,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "还记得这位妖王吗？",
        "cid": 1452568619,
        "dimension": {
          "width": 3840,
          "height": 2160,
          "rotate": 0
        },
        "season_id": 4499678,
        "short_link_v2": "https://b23.tv/BV1e1421f7rA",
        "first_frame": "http://i2.hdslb.com/bfs/storyff/n240227sauzmn6l1y49t5cjnklc5tyvk_firsti.jpg",
        "pub_location": "吉林",
        "cover43": "",
        "tidv2": 2024,
        "tnamev2": "电台·歌单",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1e1421f7rA",
        "season_type": 1,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 1601123876,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 1581914,
        "videos": 1,
        "tid": 130,
        "tname": "音乐综合",
        "copyright": 2,
        "pic": "http://i2.hdslb.com/bfs/archive/7437f19df1061f4a9cd2972b81dbd3a6723bf74c.jpg",
        "title": "妖王都开始男人了，怎么办！",
        "pubdate": 1412259320,
        "ctime": 1497428704,
        "desc": "音悦台 保加利亚妖男Azis /Азис携手流行男歌手Giorgos Tsalikis/Тсаликис 最新单曲 Estar Loco /Полудяваме\n纯爷们，男人就该干男人，该干的事。",
        "state": 0,
        "duration": 227,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 4685783,
          "name": "FoolishJoker",
          "face": "https://i2.hdslb.com/bfs/face/a81786a76af0cbd6d7e35adc488ccc22b0030d72.jpg"
        },
        "stat": {
          "aid": 1581914,
          "view": 2303678,
          "danmaku": 5815,
          "reply": 6856,
          "favorite": 28958,
          "coin": 5696,
          "share": 14014,
          "now_rank": 0,
          "his_rank": 0,
          "like": 24255,
          "dislike": 0,
          "vt": 0,
          "vv": 2303678,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 2403522,
        "dimension": {
          "width": 640,
          "height": 360,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1gx411P77L",
        "up_from_v2": 8,
        "cover43": "",
        "tidv2": 2027,
        "tnamev2": "音乐综合",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1gx411P77L",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 1581914,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 31130726,
        "videos": 1,
        "tid": 130,
        "tname": "音乐综合",
        "copyright": 2,
        "pic": "http://i0.hdslb.com/bfs/archive/e9755c62c5a38ec352e424aa0d7d20417c1a3fde.jpg",
        "title": "PPAP原版完整视频",
        "pubdate": 1536122369,
        "ctime": 1536122367,
        "desc": "视频时长令强迫症不爽（我故意的）",
        "state": 0,
        "duration": 121,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 180305935,
          "name": "不懂事的记忆",
          "face": "https://i1.hdslb.com/bfs/face/7c1510f2fc8911cf885c9b14a94a99db738813c2.jpg"
        },
        "stat": {
          "aid": 31130726,
          "view": 3810989,
          "danmaku": 5269,
          "reply": 2587,
          "favorite": 76845,
          "coin": 7721,
          "share": 21117,
          "now_rank": 0,
          "his_rank": 0,
          "like": 122042,
          "dislike": 0,
          "vt": 0,
          "vv": 3810989,
          "fav_g": 8,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 54379754,
        "dimension": {
          "width": 640,
          "height": 360,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1BW411Z7J3",
        "up_from_v2": 8,
        "cover43": "",
        "tidv2": 2027,
        "tnamev2": "音乐综合",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1BW411Z7J3",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 31130726,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 675490509,
        "videos": 1,
        "tid": 138,
        "tname": "搞笑",
        "copyright": 2,
        "pic": "http://i1.hdslb.com/bfs/archive/58f8f3c8dfcf3b1ac6cf7a7b0eda660aa2e1e1fc.jpg",
        "title": "奥地利美术生就业经历",
        "pubdate": 1631273645,
        "ctime": 1631272999,
        "desc": "https://m.youtube.com/watch?v=h7s410TPnWg",
        "state": 0,
        "duration": 128,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 489656132,
          "name": "古米廖夫",
          "face": "https://i2.hdslb.com/bfs/face/633ed3ba1ec5bcde5db105849c2498b03f6b7eee.jpg"
        },
        "stat": {
          "aid": 675490509,
          "view": 40823108,
          "danmaku": 48676,
          "reply": 12360,
          "favorite": 952804,
          "coin": 557605,
          "share": 256173,
          "now_rank": 0,
          "his_rank": 0,
          "like": 1531015,
          "dislike": 0,
          "vt": 0,
          "vv": 40823108,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 405970117,
        "dimension": {
          "width": 1280,
          "height": 720,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1jU4y1N7vg",
        "up_from_v2": 35,
        "first_frame": "http://i1.hdslb.com/bfs/storyff/n210910a2u7yjx97xzec435kyzziyn8s_firsti.jpg",
        "pub_location": "黑龙江",
        "cover43": "",
        "tidv2": 2060,
        "tnamev2": "鬼畜剧场",
        "pid_v2": 1007,
        "pid_name_v2": "鬼畜",
        "bvid": "BV1jU4y1N7vg",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 675490509,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 44501,
        "videos": 1,
        "tid": 26,
        "tname": "音MAD",
        "copyright": 2,
        "pic": "http://i0.hdslb.com/bfs/archive/1dff881735a73cdc4757237e45eff03d42c81137.jpg",
        "title": "久本雅美の頭がカービィのBGMに合わせて爆発したようです",
        "pubdate": 1293118092,
        "ctime": 1497366357,
        "desc": "sm6999999 恭请四代御本尊様，45秒后大量召唤三色弹幕，顺带头像同步测试┗(＾o＾ )┓",
        "state": 0,
        "duration": 72,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 59948,
          "name": "高興帝",
          "face": "http://i2.hdslb.com/bfs/face/68a4fb8cf9442f0db277d58a9dbccbf02eacdad4.jpg"
        },
        "stat": {
          "aid": 44501,
          "view": 2450853,
          "danmaku": 16774,
          "reply": 5627,
          "favorite": 25342,
          "coin": 3316,
          "share": 3531,
          "now_rank": 0,
          "his_rank": 0,
          "like": 47552,
          "dislike": 0,
          "vt": 0,
          "vv": 2450853,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 74884,
        "dimension": {
          "width": 480,
          "height": 360,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1Bx411c7NF",
        "cover43": "",
        "tidv2": 2062,
        "tnamev2": "音MAD",
        "pid_v2": 1007,
        "pid_name_v2": "鬼畜",
        "bvid": "BV1Bx411c7NF",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 44501,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 1706416465,
        "videos": 1,
        "tid": 193,
        "tname": "MV",
        "copyright": 2,
        "pic": "http://i2.hdslb.com/bfs/archive/2365889cfca6e33566104487604138906a610c59.jpg",
        "title": "【4K珍藏】诈骗神曲《Never Gonna Give You Up》！愿者上钩！",
        "pubdate": 1723457882,
        "ctime": 1723042776,
        "desc": "《‌Never Gonna Give You Up》‌这首歌曲发行于1987年11月16日。‌这首歌曲由Rick Astley演唱，‌并收录于他的专辑《‌Whenever You Need Somebody》‌中。",
        "state": 0,
        "duration": 213,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 2043250564,
          "name": "4K音乐馆",
          "face": "https://i1.hdslb.com/bfs/face/4be964615e70e18ab469e4403cb0fa320f8d2fdc.jpg"
        },
        "stat": {
          "aid": 1706416465,
          "view": 1001774,
          "danmaku": 1150,
          "reply": 1204,
          "favorite": 20440,
          "coin": 2354,
          "share": 12072,
          "now_rank": 0,
          "his_rank": 0,
          "like": 28749,
          "dislike": 0,
          "vt": 0,
          "vv": 1001774,
          "fav_g": 38,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 1641702404,
        "dimension": {
          "width": 3840,
          "height": 2160,
          "rotate": 0
        },
        "season_id": 257515,
        "short_link_v2": "https://b23.tv/BV1UT42167xb",
        "first_frame": "http://i1.hdslb.com/bfs/storyff/n240807sa3h3ta5x4y8t48d3i1ld43yn_firsti.jpg",
        "pub_location": "山东",
        "cover43": "",
        "tidv2": 2017,
        "tnamev2": "MV",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1UT42167xb",
        "season_type": 1,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 1706416465,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 70025529,
        "videos": 1,
        "tid": 130,
        "tname": "音乐综合",
        "copyright": 2,
        "pic": "http://i0.hdslb.com/bfs/archive/49948624e5b18fda60ec255eeffe9fb86e2a73a0.jpg",
        "title": "大悲咒（高品质珍藏版）",
        "pubdate": 1570435422,
        "ctime": 1570183927,
        "desc": "净化心情，佛祖保佑，大吉大利！！！",
        "state": 0,
        "duration": 1792,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 1,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 362819520,
          "name": "抹茶牛油果",
          "face": "http://i0.hdslb.com/bfs/face/3b2571027baef2a954c2fc1b5473ed609ef00fb3.jpg"
        },
        "stat": {
          "aid": 70025529,
          "view": 15194194,
          "danmaku": 126652,
          "reply": 36609,
          "favorite": 447623,
          "coin": 115299,
          "share": 201225,
          "now_rank": 0,
          "his_rank": 0,
          "like": 432430,
          "dislike": 0,
          "vt": 0,
          "vv": 15194194,
          "fav_g": 49,
          "like_g": 0
        },
        "dynamic": "#大悲咒##高音质##循环#",
        "cid": 121325699,
        "dimension": {
          "width": 1920,
          "height": 1080,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1XE411S7Ew",
        "cover43": "",
        "tidv2": 2192,
        "tnamev2": "疗愈成长",
        "pid_v2": 1028,
        "pid_name_v2": "神秘学",
        "bvid": "BV1XE411S7Ew",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 70025529,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 827984205,
        "videos": 1,
        "tid": 193,
        "tname": "MV",
        "copyright": 2,
        "pic": "http://i1.hdslb.com/bfs/archive/ffacd250c10ca7cea1a665e89b691b3b7b837587.jpg",
        "title": "燃!保加利亚妖王2023新歌MV!",
        "pubdate": 1688208848,
        "ctime": 1688208848,
        "desc": "youtube\n保加利亚妖王azis新歌mv",
        "state": 0,
        "duration": 225,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 1295732260,
          "name": "蒂尼黄DiniHuang",
          "face": "https://i1.hdslb.com/bfs/face/71cc994f3b717fb64dec53cab8b825b471f3886a.jpg"
        },
        "stat": {
          "aid": 827984205,
          "view": 168546,
          "danmaku": 188,
          "reply": 343,
          "favorite": 851,
          "coin": 79,
          "share": 2315,
          "now_rank": 0,
          "his_rank": 0,
          "like": 4373,
          "dislike": 0,
          "vt": 0,
          "vv": 168546,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 1181623685,
        "dimension": {
          "width": 1920,
          "height": 1080,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV19g4y1A7xq",
        "up_from_v2": 8,
        "first_frame": "http://i0.hdslb.com/bfs/storyff/n230701qn3tfuifpjvvh0e2pctwqbkep_firsti.jpg",
        "pub_location": "上海",
        "cover43": "",
        "tidv2": 2017,
        "tnamev2": "MV",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV19g4y1A7xq",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 827984205,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 80573606,
        "videos": 1,
        "tid": 29,
        "tname": "音乐现场",
        "copyright": 2,
        "pic": "http://i0.hdslb.com/bfs/archive/b0433e71df7f856cf1a45a926361661eca28b8fb.jpg",
        "title": "满级大佬屠杀新手村",
        "pubdate": 1577243562,
        "ctime": 1577243562,
        "desc": "YouTube\n\n*《She Taught Me How to Yodel》\n\n约德尔唱法（Yodeling）是瑞士阿尔卑斯山区的一种特殊唱法，采用真假声迅速切换的方式演唱。“约德尔”，在当地方言中是“树林歌唱”的意思，因此有时也将其翻译为“woods sing”。\n\n小女孩叫Sofia Shkidchenko，演唱于乌克兰达人秀，她有自己的油管频道可以去订阅哦～\n\n自己也没想到随手上传的个视频突然播放量这么多，不是专业的搬运博主，此视频留作纪念，但更新随缘啦。祝大家万事如意。",
        "state": 0,
        "duration": 126,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 247412150,
          "name": "Ueroey",
          "face": "https://i2.hdslb.com/bfs/face/f8cef132ebaeac9da8c73ad52f6c53b7d1f74637.jpg"
        },
        "stat": {
          "aid": 80573606,
          "view": 62129265,
          "danmaku": 106580,
          "reply": 27081,
          "favorite": 1259191,
          "coin": 453054,
          "share": 189609,
          "now_rank": 0,
          "his_rank": 7,
          "like": 2766708,
          "dislike": 0,
          "vt": 0,
          "vv": 62129265,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "#音乐#",
        "cid": 137890032,
        "dimension": {
          "width": 638,
          "height": 312,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1LJ411W7Bo",
        "up_from_v2": 9,
        "pub_location": "浙江",
        "cover43": "",
        "tidv2": 2018,
        "tnamev2": "音乐现场",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1LJ411W7Bo",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 80573606,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 370010949,
        "videos": 2,
        "tid": 138,
        "tname": "搞笑",
        "copyright": 2,
        "pic": "http://i1.hdslb.com/bfs/archive/8339e4a40c1a10cfb0e0abe0bc4ef6ecbd61a45f.jpg",
        "title": "黑人抬棺原版视频",
        "pubdate": 1585735296,
        "ctime": 1585735296,
        "desc": "up主关于本条视频收入的说明戳：BV1YK41157dT\n转载自https://www.youtube.com/watch?v=b3Y_9bTRGVg\n其他：抖棺（肩）舞：BV1kt4y127Ee\n苏卡棺裂：BV1GZ4y1x7mZ\n我是比划，感谢您的观看感谢点赞感谢一切！改天一定陪老铁好好比划比划！（咕）\n（建议大家戳一下宝藏2p）",
        "state": 0,
        "duration": 200,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 479724334,
          "name": "比划大魔王",
          "face": "http://i1.hdslb.com/bfs/face/910e60494f7deff1b3bdcf1eaaead6779d77bac5.jpg"
        },
        "stat": {
          "aid": 370010949,
          "view": 65490009,
          "danmaku": 454078,
          "reply": 47875,
          "favorite": 1008732,
          "coin": 445010,
          "share": 783444,
          "now_rank": 0,
          "his_rank": 2,
          "like": 1912992,
          "dislike": 0,
          "vt": 0,
          "vv": 65490009,
          "fav_g": 24,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 172423516,
        "dimension": {
          "width": 1280,
          "height": 720,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1NZ4y1j7nw",
        "cover43": "",
        "tidv2": 2059,
        "tnamev2": "鬼畜调教",
        "pid_v2": 1007,
        "pid_name_v2": "鬼畜",
        "bvid": "BV1NZ4y1j7nw",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 370010949,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 161596,
        "videos": 1,
        "tid": 21,
        "tname": "日常",
        "copyright": 2,
        "pic": "http://i2.hdslb.com/bfs/archive/90bc3229e862994ac021a5f0894f232bc49b36bf.jpg",
        "title": "据说80%的男生都听过这段音乐，有木有？",
        "pubdate": 1319379031,
        "ctime": 1497399731,
        "desc": "据说男生都听过，为啥我没有呢？ ",
        "state": 0,
        "duration": 0,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 211322,
          "name": "卍解←死神",
          "face": "https://i2.hdslb.com/bfs/face/2cb86d5f33a409732e4a0dcc7cda70bc8c199a7f.jpg"
        },
        "stat": {
          "aid": 161596,
          "view": 576962,
          "danmaku": 1042,
          "reply": 1638,
          "favorite": 6576,
          "coin": 227,
          "share": 931,
          "now_rank": 0,
          "his_rank": 612,
          "like": 9845,
          "dislike": 0,
          "vt": 0,
          "vv": 576962,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 266868,
        "dimension": {
          "width": 448,
          "height": 336,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1Nx411w7tR",
        "cover43": "",
        "tidv2": 2027,
        "tnamev2": "音乐综合",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1Nx411w7tR",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 161596,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 112699505707398,
        "videos": 1,
        "tid": 22,
        "tname": "鬼畜调教",
        "copyright": 1,
        "pic": "http://i0.hdslb.com/bfs/archive/54c8218801e90a957e67541ea7d76e6d310614fe.jpg",
        "title": "【范小勤】HOP",
        "pubdate": 1719658405,
        "ctime": 1719658405,
        "desc": "",
        "state": 0,
        "duration": 200,
        "mission_id": 1729431,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 1,
          "no_reprint": 1,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 40488241,
          "name": "帅气的五岁少年",
          "face": "https://i1.hdslb.com/bfs/face/0438443dd2bbb2fe1b46aa1d2134745f8d9f26c8.jpg"
        },
        "stat": {
          "aid": 112699505707398,
          "view": 47395,
          "danmaku": 176,
          "reply": 125,
          "favorite": 566,
          "coin": 242,
          "share": 1366,
          "now_rank": 0,
          "his_rank": 0,
          "like": 1598,
          "dislike": 0,
          "vt": 0,
          "vv": 47395,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 500001599795260,
        "dimension": {
          "width": 1440,
          "height": 1080,
          "rotate": 0
        },
        "season_id": 3617308,
        "short_link_v2": "https://b23.tv/BV1J63veXEvH",
        "first_frame": "http://i1.hdslb.com/bfs/storyff/n240629sabnqqnvswrfyh2h8capwsas5_firsti.jpg",
        "pub_location": "上海",
        "cover43": "",
        "tidv2": 2059,
        "tnamev2": "鬼畜调教",
        "pid_v2": 1007,
        "pid_name_v2": "鬼畜",
        "bvid": "BV1J63veXEvH",
        "season_type": 1,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 112699505707398,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 345957866,
        "videos": 1,
        "tid": 193,
        "tname": "MV",
        "copyright": 2,
        "pic": "http://i2.hdslb.com/bfs/archive/2327de6051626e9f263e265805cbb1be3a05ad8d.jpg",
        "title": "【越南神曲】-《Kẻ Cắp Gặp Bà Già 》！终于找到原版了！",
        "pubdate": 1664102700,
        "ctime": 1664027264,
        "desc": "提到「越南电音」，大家可能会感到比较陌生，甚至摸不着头脑。 事实上，越南电音已经席卷国内短视频平台，没有人可以逃过它的轰炸。  音乐一开，无人不嗨～",
        "state": 0,
        "duration": 234,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 0,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 2043250564,
          "name": "4K音乐馆",
          "face": "https://i1.hdslb.com/bfs/face/4be964615e70e18ab469e4403cb0fa320f8d2fdc.jpg"
        },
        "stat": {
          "aid": 345957866,
          "view": 8519264,
          "danmaku": 3892,
          "reply": 3755,
          "favorite": 143914,
          "coin": 9867,
          "share": 8152,
          "now_rank": 0,
          "his_rank": 0,
          "like": 136218,
          "dislike": 0,
          "vt": 0,
          "vv": 8519264,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 842321779,
        "dimension": {
          "width": 3840,
          "height": 2160,
          "rotate": 0
        },
        "season_id": 725909,
        "short_link_v2": "https://b23.tv/BV1Ud4y1M7C7",
        "first_frame": "http://i1.hdslb.com/bfs/storyff/n220924qn371jsgk4te6781w32102ovo_firsti.jpg",
        "pub_location": "山东",
        "cover43": "",
        "tidv2": 2017,
        "tnamev2": "MV",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1Ud4y1M7C7",
        "season_type": 1,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 345957866,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 456093155,
        "videos": 1,
        "tid": 59,
        "tname": "演奏",
        "copyright": 1,
        "pic": "http://i2.hdslb.com/bfs/archive/9c160af2907ba2c161d565a99e61032ba72868ff.png",
        "title": "太羞耻了！敢于琴行挑战演奏《Hop》！",
        "pubdate": 1592883074,
        "ctime": 1592883074,
        "desc": "太羞耻了！敢于琴行挑战演奏《Hop》！     Hop改编版",
        "state": 0,
        "duration": 168,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 1,
          "no_reprint": 1,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 13677047,
          "name": "Piano莱特",
          "face": "https://i2.hdslb.com/bfs/face/edf6a0ae7dfe9adb5e8d5e813a69455554931c73.jpg"
        },
        "stat": {
          "aid": 456093155,
          "view": 1432473,
          "danmaku": 3867,
          "reply": 1839,
          "favorite": 14907,
          "coin": 7949,
          "share": 5164,
          "now_rank": 0,
          "his_rank": 0,
          "like": 75832,
          "dislike": 0,
          "vt": 0,
          "vv": 1432473,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 204234033,
        "dimension": {
          "width": 3840,
          "height": 2160,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1r5411W71r",
        "cover43": "",
        "tidv2": 2021,
        "tnamev2": "演奏",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1r5411W71r",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 456093155,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 88379669,
        "videos": 1,
        "tid": 138,
        "tname": "搞笑",
        "copyright": 1,
        "pic": "http://i0.hdslb.com/bfs/archive/44deb7e35de1c0d19fc79e6f838ad334585755f6.jpg",
        "title": "当你怂恿网课老师放HOP",
        "pubdate": 1581481509,
        "ctime": 1581481509,
        "desc": "我受不了了我要笑死了\n网课欢乐多",
        "state": 0,
        "duration": 131,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 1,
          "no_reprint": 1,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 8307655,
          "name": "-Holog-",
          "face": "https://i1.hdslb.com/bfs/face/797edf7cf269bdf89d1deb46b2b5068e65920b88.jpg"
        },
        "stat": {
          "aid": 88379669,
          "view": 1553672,
          "danmaku": 5349,
          "reply": 1662,
          "favorite": 7998,
          "coin": 2519,
          "share": 6023,
          "now_rank": 0,
          "his_rank": 0,
          "like": 57979,
          "dislike": 0,
          "vt": 0,
          "vv": 1553672,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "#保加利亚妖王##搞笑视频##HOP#\n把害怕打在公屏上_(:з」∠)_",
        "cid": 150977310,
        "dimension": {
          "width": 1920,
          "height": 1080,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1D7411G76q",
        "up_from_v2": 8,
        "cover43": "",
        "tidv2": 2207,
        "tnamev2": "随拍·综合",
        "pid_v2": 1032,
        "pid_name_v2": "其他",
        "bvid": "BV1D7411G76q",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 88379669,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 752882938,
        "videos": 1,
        "tid": 21,
        "tname": "日常",
        "copyright": 1,
        "pic": "http://i0.hdslb.com/bfs/archive/f5a60b4edaef1b44faab4ffc47384843a7d47c56.jpg",
        "title": "【av100000000】b站视频破亿了！第一亿个视频十小时循环（补档）",
        "pubdate": 1588142976,
        "ctime": 1588142976,
        "desc": "【av100000000】b站视频破亿了！第一亿个视频十小时循环（补档）\nBV1y7411Q743/av100000000",
        "state": 0,
        "duration": 36000,
        "mission_id": 13243,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 1,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 382043832,
          "name": "輝夜姬想讓人告白",
          "face": "https://i0.hdslb.com/bfs/face/647d2a40ac51b8e1379d6c46c64f5a8e28b269ab.jpg"
        },
        "stat": {
          "aid": 752882938,
          "view": 161614,
          "danmaku": 357,
          "reply": 497,
          "favorite": 1217,
          "coin": 165,
          "share": 166,
          "now_rank": 0,
          "his_rank": 0,
          "like": 4623,
          "dislike": 0,
          "vt": 0,
          "vv": 161614,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "#B站##BILIBILI##哔哩哔哩#",
        "cid": 184673331,
        "dimension": {
          "width": 960,
          "height": 600,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1Yk4y1r7g2",
        "cover43": "",
        "tidv2": 2207,
        "tnamev2": "随拍·综合",
        "pid_v2": 1032,
        "pid_name_v2": "其他",
        "bvid": "BV1Yk4y1r7g2",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 752882938,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 676186170,
        "videos": 1,
        "tid": 193,
        "tname": "MV",
        "copyright": 2,
        "pic": "http://i1.hdslb.com/bfs/archive/24e8bd7eb31bbc142cd2676d28efa4c45c06bc33.jpg",
        "title": "【4K60FPS】查理·普斯《See You Again》爆火神曲！珍惜身边的人！",
        "pubdate": 1634983053,
        "ctime": 1634983053,
        "desc": "官方MV\n原盘提取制作，进行了部分调整\n中英文双语字幕制作，自己双语翻译\n《See You Again》是由美国说唱歌手维兹·卡利法与歌手查理·普斯合作演唱的一首歌曲\n这首歌，我想不用多说了，因为太多人点这首歌了\n希望大家珍惜身边的人",
        "state": 0,
        "duration": 229,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 0,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 229733301,
          "name": "音乐私藏馆",
          "face": "https://i0.hdslb.com/bfs/face/91a6526445f61e2d491523242b532d5e76f0435a.jpg"
        },
        "stat": {
          "aid": 676186170,
          "view": 19331747,
          "danmaku": 55418,
          "reply": 19047,
          "favorite": 459123,
          "coin": 125647,
          "share": 58270,
          "now_rank": 0,
          "his_rank": 30,
          "like": 560583,
          "dislike": 0,
          "vt": 0,
          "vv": 19331747,
          "fav_g": 208,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 429657756,
        "dimension": {
          "width": 3840,
          "height": 2160,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1qU4y1F73A",
        "first_frame": "http://i1.hdslb.com/bfs/storyff/n211023qn35uju26iwo4pw2enpricqvy_firsti.jpg",
        "pub_location": "陕西",
        "cover43": "",
        "tidv2": 2017,
        "tnamev2": "MV",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1qU4y1F73A",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 676186170,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 11841799,
        "videos": 1,
        "tid": 236,
        "tname": "竞技体育",
        "copyright": 2,
        "pic": "http://i2.hdslb.com/bfs/archive/20b223c72345a544272f70014f3a9ce2e30b39c8.jpg",
        "title": "【万恶之源】游泳教练原视频",
        "pubdate": 1499056716,
        "ctime": 1499056716,
        "desc": "在网盘里翻出来的不知道有没有人上传过。不断地摸索和练习，你就学会了游泳\n其中重点不能上传，我试过一次了。",
        "state": 0,
        "duration": 231,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 25844288,
          "name": "希爾薇",
          "face": "https://i2.hdslb.com/bfs/face/67b49b90952cd64320432ae561e78e54ea3ecb53.jpg"
        },
        "stat": {
          "aid": 11841799,
          "view": 693786,
          "danmaku": 4253,
          "reply": 1097,
          "favorite": 20296,
          "coin": 2820,
          "share": 14821,
          "now_rank": 0,
          "his_rank": 0,
          "like": 13990,
          "dislike": 0,
          "vt": 0,
          "vv": 693786,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 19555184,
        "dimension": {
          "width": 352,
          "height": 288,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1ox411B7jr",
        "cover43": "",
        "tidv2": 2063,
        "tnamev2": "鬼畜综合",
        "pid_v2": 1007,
        "pid_name_v2": "鬼畜",
        "bvid": "BV1ox411B7jr",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 11841799,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 96842562,
        "videos": 1,
        "tid": 193,
        "tname": "MV",
        "copyright": 2,
        "pic": "http://i0.hdslb.com/bfs/archive/5c33d3957fee3dac7376ab12b3e9a2b595600d84.jpg",
        "title": "真正的冰雪女王",
        "pubdate": 1584448702,
        "ctime": 1584448702,
        "desc": "转载https://weibo.com/tv/v/FlXRiE62K?fid=1034:217aa2b6ddb0f47e65468914c7d2c9af\n妖王的歌简直可以洗涤灵魂",
        "state": 0,
        "duration": 219,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 388982725,
          "name": "萌萌四海为家",
          "face": "https://i1.hdslb.com/bfs/face/f4ce35193db8743094a4efb4e00e97442244f2aa.jpg"
        },
        "stat": {
          "aid": 96842562,
          "view": 39902,
          "danmaku": 47,
          "reply": 32,
          "favorite": 372,
          "coin": 39,
          "share": 627,
          "now_rank": 0,
          "his_rank": 0,
          "like": 507,
          "dislike": 0,
          "vt": 0,
          "vv": 39902,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "#欧美MV##BGM##歌曲#",
        "cid": 165335972,
        "dimension": {
          "width": 480,
          "height": 360,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1V7411Z7HX",
        "cover43": "",
        "tidv2": 2017,
        "tnamev2": "MV",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1V7411Z7HX",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 96842562,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 84204989,
        "videos": 1,
        "tid": 267,
        "tname": "电台",
        "copyright": 1,
        "pic": "http://i0.hdslb.com/bfs/archive/c6533d1b6c9fcd3cd574a0117acaa4e5ddbe7fa4.jpg",
        "title": "【B站入站曲】（全站最清晰音质）",
        "pubdate": 1579462179,
        "ctime": 1579462179,
        "desc": "【B站音乐同名】本曲是本人使用Chrome+多种技术手段历时4个小时扒出的原曲，扒曲不易（如有异议请自行尝试即可知之），请多支持！",
        "state": 0,
        "duration": 131,
        "mission_id": 12642,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 1,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 189708807,
          "name": "Yc云灿",
          "face": "https://i0.hdslb.com/bfs/face/c815a0c66ab6adbd208558a0fe25c59c6ee916fa.jpg"
        },
        "stat": {
          "aid": 84204989,
          "view": 113298,
          "danmaku": 2640,
          "reply": 426,
          "favorite": 6659,
          "coin": 1578,
          "share": 238,
          "now_rank": 0,
          "his_rank": 0,
          "like": 8192,
          "dislike": 0,
          "vt": 0,
          "vv": 113298,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "#2019##2019年度报告##年度报告#",
        "cid": 144036516,
        "dimension": {
          "width": 1920,
          "height": 1080,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV157411v76Z",
        "pub_location": "山西",
        "cover43": "",
        "tidv2": 2024,
        "tnamev2": "电台·歌单",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV157411v76Z",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 84204989,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 45213203,
        "videos": 1,
        "tid": 138,
        "tname": "搞笑",
        "copyright": 1,
        "pic": "http://i0.hdslb.com/bfs/archive/1c73c8c16fe733568c3b6a5332c85be3ddc41acd.jpg",
        "title": "如果把极乐净土的背景音乐换成hop会怎么样",
        "pubdate": 1551585358,
        "ctime": 1551585358,
        "desc": "-",
        "state": 0,
        "duration": 222,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 1,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 300015102,
          "name": "砂糖血块",
          "face": "https://i0.hdslb.com/bfs/face/77d73e4aa3fa669255be492596e02f1570f4fb5d.jpg"
        },
        "stat": {
          "aid": 45213203,
          "view": 521576,
          "danmaku": 4054,
          "reply": 867,
          "favorite": 12646,
          "coin": 12832,
          "share": 8799,
          "now_rank": 0,
          "his_rank": 0,
          "like": 31530,
          "dislike": 0,
          "vt": 0,
          "vv": 521576,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 79166580,
        "dimension": {
          "width": 1144,
          "height": 640,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1bb411B7dn",
        "cover43": "",
        "tidv2": 2036,
        "tnamev2": "舞蹈综合",
        "pid_v2": 1004,
        "pid_name_v2": "舞蹈",
        "bvid": "BV1bb411B7dn",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 45213203,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 66372123,
        "videos": 1,
        "tid": 21,
        "tname": "日常",
        "copyright": 1,
        "pic": "http://i2.hdslb.com/bfs/archive/a12315d2efc49f1862be996093c8076284719e43.jpg",
        "title": "学校食堂公然放HOP，这到底是人性的泯灭，还是道德的伦桑？",
        "pubdate": 1567398824,
        "ctime": 1567398825,
        "desc": "吃饭时的我惊呆了。。。",
        "state": 0,
        "duration": 61,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 1,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 298061175,
          "name": "Dusk-氵夕",
          "face": "https://i0.hdslb.com/bfs/face/803bf620ead9c25168935e31797b25d51f2cb614.jpg"
        },
        "stat": {
          "aid": 66372123,
          "view": 270243,
          "danmaku": 238,
          "reply": 211,
          "favorite": 1443,
          "coin": 116,
          "share": 427,
          "now_rank": 0,
          "his_rank": 0,
          "like": 7846,
          "dislike": 0,
          "vt": 0,
          "vv": 270243,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "#自制##奇葩##HOP#",
        "cid": 115113475,
        "dimension": {
          "width": 1280,
          "height": 720,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV174411177w",
        "up_from_v2": 8,
        "pub_location": "宁夏",
        "cover43": "",
        "tidv2": 2088,
        "tnamev2": "社会观察",
        "pid_v2": 1010,
        "pid_name_v2": "知识",
        "bvid": "BV174411177w",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 66372123,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 669351541,
        "videos": 1,
        "tid": 138,
        "tname": "搞笑",
        "copyright": 1,
        "pic": "http://i2.hdslb.com/bfs/archive/fa08f65dc87fa6a26a99d0dc6fbc141adcef917b.jpg",
        "title": "这TM才是东京热！！！",
        "pubdate": 1597827562,
        "ctime": 1597827562,
        "desc": "祝大家长高3cm！",
        "state": 0,
        "duration": 73,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 1,
          "no_reprint": 1,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 641529005,
          "name": "海胆君の日本留学日记",
          "face": "https://i2.hdslb.com/bfs/face/75b3ddf5767533667d08c4475823fdf6ed7111d0.jpg"
        },
        "stat": {
          "aid": 669351541,
          "view": 183005,
          "danmaku": 78,
          "reply": 54,
          "favorite": 685,
          "coin": 101,
          "share": 225,
          "now_rank": 0,
          "his_rank": 0,
          "like": 1310,
          "dislike": 0,
          "vt": 0,
          "vv": 183005,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "#bilibili新星计划##搞笑##全程高能#",
        "cid": 226269297,
        "dimension": {
          "width": 1920,
          "height": 1080,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1ea4y177Rj",
        "pub_location": "辽宁",
        "cover43": "",
        "tidv2": 2002,
        "tnamev2": "影视剪辑",
        "pid_v2": 1001,
        "pid_name_v2": "影视",
        "bvid": "BV1ea4y177Rj",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 669351541,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 239236582,
        "videos": 1,
        "tid": 22,
        "tname": "鬼畜调教",
        "copyright": 1,
        "pic": "http://i2.hdslb.com/bfs/archive/60e0c8b0bdb8781ae5213d06e35a80e416b624fd.jpg",
        "title": "av10388闪版",
        "pubdate": 1706161150,
        "ctime": 1706160987,
        "desc": "-",
        "state": 0,
        "duration": 72,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 1,
          "no_reprint": 1,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 352435610,
          "name": "尼911a",
          "face": "https://i2.hdslb.com/bfs/face/dca0c49ddabaae204209764e73a1eeddd4e94fa3.jpg"
        },
        "stat": {
          "aid": 239236582,
          "view": 98736,
          "danmaku": 149,
          "reply": 201,
          "favorite": 700,
          "coin": 45,
          "share": 379,
          "now_rank": 0,
          "his_rank": 0,
          "like": 875,
          "dislike": 0,
          "vt": 0,
          "vv": 98736,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 1418632218,
        "dimension": {
          "width": 1920,
          "height": 1080,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1he411Y7MB",
        "up_from_v2": 11,
        "first_frame": "http://i2.hdslb.com/bfs/storyff/n240125saqkgdlb6aio291t2cc5qola0_firsti.jpg",
        "pub_location": "江苏",
        "cover43": "",
        "tidv2": 2207,
        "tnamev2": "随拍·综合",
        "pid_v2": 1032,
        "pid_name_v2": "其他",
        "bvid": "BV1he411Y7MB",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 239236582,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 294464399,
        "videos": 1,
        "tid": 21,
        "tname": "日常",
        "copyright": 1,
        "pic": "http://i2.hdslb.com/bfs/archive/8327a7955381a3a7fc0606b08ad87dd74a948a4b.png",
        "title": "B站的两个极限AV号被我找到了！",
        "pubdate": 1638019819,
        "ctime": 1638019819,
        "desc": "-",
        "state": 0,
        "duration": 71,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 495847991,
          "name": "Tedsan",
          "face": "https://i2.hdslb.com/bfs/face/d3689b9a5f93d82deb1f8b6a081767a16b16e5ca.jpg"
        },
        "stat": {
          "aid": 294464399,
          "view": 86852,
          "danmaku": 25,
          "reply": 280,
          "favorite": 338,
          "coin": 54,
          "share": 61,
          "now_rank": 0,
          "his_rank": 0,
          "like": 450,
          "dislike": 0,
          "vt": 0,
          "vv": 86852,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 450235439,
        "dimension": {
          "width": 1440,
          "height": 720,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1fF411b7Hm",
        "up_from_v2": 19,
        "first_frame": "http://i1.hdslb.com/bfs/storyff/n211127a23442em8g5nug2775mg3789m_firsti.jpg",
        "pub_location": "四川",
        "cover43": "",
        "tidv2": 2207,
        "tnamev2": "随拍·综合",
        "pid_v2": 1032,
        "pid_name_v2": "其他",
        "bvid": "BV1fF411b7Hm",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 294464399,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 592220402,
        "videos": 1,
        "tid": 193,
        "tname": "MV",
        "copyright": 2,
        "pic": "http://i2.hdslb.com/bfs/archive/234b7c4a99412224007bf21a0e3902946dc45cd6.jpg",
        "title": "【4K50帧】“我在东北玩泥巴”原曲 Daler Mehndi - Tunak Tunak Tun",
        "pubdate": 1638883948,
        "ctime": 1638883948,
        "desc": "-",
        "state": 0,
        "duration": 257,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 0,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 472562429,
          "name": "智英武54",
          "face": "https://i2.hdslb.com/bfs/face/e7bb5b2f16863992562f10ce2a686035bf33a1b4.jpg"
        },
        "stat": {
          "aid": 592220402,
          "view": 2711581,
          "danmaku": 7298,
          "reply": 1980,
          "favorite": 58898,
          "coin": 5115,
          "share": 17577,
          "now_rank": 0,
          "his_rank": 0,
          "like": 72931,
          "dislike": 0,
          "vt": 0,
          "vv": 2711581,
          "fav_g": 11,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 456563995,
        "dimension": {
          "width": 2880,
          "height": 2160,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1bq4y1q7Ho",
        "up_from_v2": 8,
        "first_frame": "http://i2.hdslb.com/bfs/storyff/n211207a24niqqktio4no1wmwd5tsget_firsti.jpg",
        "pub_location": "江苏",
        "cover43": "",
        "tidv2": 2017,
        "tnamev2": "MV",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1bq4y1q7Ho",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 592220402,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 441264199,
        "videos": 1,
        "tid": 26,
        "tname": "音MAD",
        "copyright": 1,
        "pic": "http://i0.hdslb.com/bfs/archive/4e36449edad0021385e5477bbe427ca9243d549a.jpg",
        "title": "五大哲学",
        "pubdate": 1679426636,
        "ctime": 1679426636,
        "desc": "-",
        "state": 0,
        "duration": 13,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 1,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 613658683,
          "name": "长瀞重度依赖",
          "face": "https://i1.hdslb.com/bfs/face/c53f852b5ca574eed9be9877d7ce3f28a2e89385.jpg"
        },
        "stat": {
          "aid": 441264199,
          "view": 671881,
          "danmaku": 92,
          "reply": 230,
          "favorite": 2720,
          "coin": 228,
          "share": 1060,
          "now_rank": 0,
          "his_rank": 0,
          "like": 9049,
          "dislike": 0,
          "vt": 0,
          "vv": 671881,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 1064182352,
        "dimension": {
          "width": 720,
          "height": 720,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1nL411r7mS",
        "up_from_v2": 8,
        "first_frame": "http://i2.hdslb.com/bfs/storyff/n230322qntglnzeqo4m1c23cnoyehccs_firsti.jpg",
        "pub_location": "广西",
        "cover43": "",
        "tidv2": 2015,
        "tnamev2": "娱乐综合",
        "pid_v2": 1002,
        "pid_name_v2": "娱乐",
        "bvid": "BV1nL411r7mS",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 441264199,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 49016435,
        "videos": 1,
        "tid": 31,
        "tname": "翻唱",
        "copyright": 1,
        "pic": "http://i2.hdslb.com/bfs/archive/9b7da84975469b7ddcd78717d06c092c4433ccf4.jpg",
        "title": "【喵会长】妹子竟被逼着翻唱保加利亚妖王！⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄！",
        "pubdate": 1555135227,
        "ctime": 1554999201,
        "desc": "这次视频改了N遍，剪的好累~希望大家能多多支持一下\n网易云音频链接：https://music.163.com/#/song?id=1358976277\n关注微博有惊喜！@隔壁班的喵会长",
        "state": 0,
        "duration": 200,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 1,
          "no_reprint": 1,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 21330948,
          "name": "隔壁班的喵会长",
          "face": "https://i0.hdslb.com/bfs/face/75a4a80496daacb478496f6a0aaf4d3ab357393d.jpg"
        },
        "stat": {
          "aid": 49016435,
          "view": 1988312,
          "danmaku": 8866,
          "reply": 5413,
          "favorite": 53008,
          "coin": 136074,
          "share": 13019,
          "now_rank": 0,
          "his_rank": 4,
          "like": 268302,
          "dislike": 0,
          "vt": 0,
          "vv": 1988312,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "那个曾经制霸b站的男银又肥来了！！！！",
        "cid": 86290623,
        "dimension": {
          "width": 1920,
          "height": 1080,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1vb411M79s",
        "pub_location": "山西",
        "cover43": "",
        "tidv2": 2061,
        "tnamev2": "人力VOCALOID",
        "pid_v2": 1007,
        "pid_name_v2": "鬼畜",
        "bvid": "BV1vb411M79s",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 49016435,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 730704908,
        "videos": 1,
        "tid": 193,
        "tname": "MV",
        "copyright": 2,
        "pic": "http://i1.hdslb.com/bfs/archive/2fd2b442a3f42ed0ba20c5204afdd92dbdfb9a68.jpg",
        "title": "【越南神曲】-《Cứ Chill Thôi》！终于找到原版了！",
        "pubdate": 1663586400,
        "ctime": 1663574508,
        "desc": "听完以后瞬间心情舒畅，太绝了!",
        "state": 0,
        "duration": 281,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 0,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 2043250564,
          "name": "4K音乐馆",
          "face": "https://i1.hdslb.com/bfs/face/4be964615e70e18ab469e4403cb0fa320f8d2fdc.jpg"
        },
        "stat": {
          "aid": 730704908,
          "view": 4715077,
          "danmaku": 3141,
          "reply": 4132,
          "favorite": 75716,
          "coin": 9002,
          "share": 7597,
          "now_rank": 0,
          "his_rank": 0,
          "like": 79627,
          "dislike": 0,
          "vt": 0,
          "vv": 4715077,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 837595821,
        "dimension": {
          "width": 3840,
          "height": 2160,
          "rotate": 0
        },
        "season_id": 725909,
        "short_link_v2": "https://b23.tv/BV1GD4y1i7dA",
        "first_frame": "http://i2.hdslb.com/bfs/storyff/n220919qn29hpyl52if2k1dthb32a0ji_firsti.jpg",
        "pub_location": "山东",
        "cover43": "",
        "tidv2": 2017,
        "tnamev2": "MV",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1GD4y1i7dA",
        "season_type": 1,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 730704908,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 413754644,
        "videos": 1,
        "tid": 59,
        "tname": "演奏",
        "copyright": 1,
        "pic": "http://i0.hdslb.com/bfs/archive/4769bc9c91af6fc8598d1b22d16033b540af33a8.jpg",
        "title": "【东京热】TOKY HOT THEME SONG ( FULL VERSION)",
        "pubdate": 1594208253,
        "ctime": 1594208253,
        "desc": "-",
        "state": 0,
        "duration": 157,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 1,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 476156735,
          "name": "星际的小喵",
          "face": "http://i2.hdslb.com/bfs/face/b6fcd4d4d23047432012576dda4239b5d0b5fa6e.jpg"
        },
        "stat": {
          "aid": 413754644,
          "view": 476215,
          "danmaku": 166,
          "reply": 906,
          "favorite": 6630,
          "coin": 627,
          "share": 3116,
          "now_rank": 0,
          "his_rank": 0,
          "like": 6086,
          "dislike": 0,
          "vt": 0,
          "vv": 476215,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "#日本##音乐##东京#",
        "cid": 210245452,
        "dimension": {
          "width": 426,
          "height": 240,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1pV41167y7",
        "cover43": "",
        "tidv2": 2027,
        "tnamev2": "音乐综合",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1pV41167y7",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 413754644,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 468509831,
        "videos": 1,
        "tid": 193,
        "tname": "MV",
        "copyright": 2,
        "pic": "http://i0.hdslb.com/bfs/archive/03971484b4c3931e89cbcf5862f8c10645e6aaec.jpg",
        "title": "补裆 av3440 -",
        "pubdate": 1651067890,
        "ctime": 1651067890,
        "desc": "新浪\nbiliplus，里面只有残缺的信息，发布时间应该是2010-2-27",
        "state": 0,
        "duration": 215,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 675115853,
          "name": "゚゙゙゙゚゚゙゚゚",
          "face": "https://i2.hdslb.com/bfs/face/8706d12c0df1f27aff5ae3c045b7da0133bd8c4a.png"
        },
        "stat": {
          "aid": 468509831,
          "view": 280276,
          "danmaku": 89,
          "reply": 324,
          "favorite": 4518,
          "coin": 151,
          "share": 209,
          "now_rank": 0,
          "his_rank": 0,
          "like": 6403,
          "dislike": 0,
          "vt": 0,
          "vv": 280276,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 586522933,
        "dimension": {
          "width": 320,
          "height": 240,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1H541117sZ",
        "up_from_v2": 8,
        "first_frame": "http://i2.hdslb.com/bfs/storyff/n220427qn2g6emv26rnqxq247csj5kgn_firsti.jpg",
        "cover43": "",
        "tidv2": 2027,
        "tnamev2": "音乐综合",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1H541117sZ",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 468509831,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 19390801,
        "videos": 1,
        "tid": 22,
        "tname": "鬼畜调教",
        "copyright": 1,
        "pic": "http://i0.hdslb.com/bfs/archive/d52994a1876d07a975dc6683b78a898d9b581208.png",
        "title": "【春晚鬼畜】赵本山：我就是念诗之王！【改革春风吹满地】",
        "pubdate": 1518339644,
        "ctime": 1518230987,
        "desc": "小时候每次吃完年夜饭，都会急急忙忙跑回自己房间跟朋友玩彩虹岛，街头篮球，泡泡堂，极品飞车，CS。一旦听到外面大人们喊“哦！赵本山来咯！”，就马上暂停手上的游戏赶紧跑出去看。对我来说没有赵本山的春晚根本不是春晚。\n鬼畜本家：av18521530\n【举起手来】花姑娘又要吸旺仔牛奶！\nby @疯猴pme",
        "state": 0,
        "duration": 152,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 353246678,
          "name": "UP-Sings",
          "face": "http://i2.hdslb.com/bfs/face/224815f69567dfbdacffc64185b89568bf8da0f3.jpg"
        },
        "stat": {
          "aid": 19390801,
          "view": 123739584,
          "danmaku": 667864,
          "reply": 325458,
          "favorite": 3047850,
          "coin": 4800461,
          "share": 1494973,
          "now_rank": 0,
          "his_rank": 3,
          "like": 5445710,
          "dislike": 0,
          "vt": 0,
          "vv": 123739584,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "不管今年春晚有没有本山叔，鬼畜区总归是有的！",
        "cid": 31621681,
        "dimension": {
          "width": 640,
          "height": 360,
          "rotate": 0
        },
        "season_id": 879555,
        "short_link_v2": "https://b23.tv/BV1bW411n7fY",
        "cover43": "",
        "tidv2": 2059,
        "tnamev2": "鬼畜调教",
        "pid_v2": 1007,
        "pid_name_v2": "鬼畜",
        "bvid": "BV1bW411n7fY",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 19390801,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 305593327,
        "videos": 1,
        "tid": 255,
        "tname": "颜值·网红舞",
        "copyright": 1,
        "pic": "http://i2.hdslb.com/bfs/archive/b4917bb0a9147f205e6af9d87d6d50b864a7a97f.jpg",
        "title": "蝴蝶步2.0(◦˙▽˙◦)",
        "pubdate": 1669474753,
        "ctime": 1669474753,
        "desc": "-",
        "state": 0,
        "duration": 15,
        "mission_id": 1039224,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 43724742,
          "name": "怎么这样的呐",
          "face": "https://i0.hdslb.com/bfs/face/f9e9ae6025a9e02b134eec3dd84b87c3689216a3.jpg"
        },
        "stat": {
          "aid": 305593327,
          "view": 13909975,
          "danmaku": 1401,
          "reply": 7111,
          "favorite": 235000,
          "coin": 83120,
          "share": 24633,
          "now_rank": 0,
          "his_rank": 0,
          "like": 383239,
          "dislike": 0,
          "vt": 0,
          "vv": 13909975,
          "fav_g": 14,
          "like_g": 0
        },
        "dynamic": "双更一下~",
        "cid": 904012490,
        "dimension": {
          "width": 1456,
          "height": 2592,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1kP411u7jr",
        "up_from_v2": 19,
        "first_frame": "http://i2.hdslb.com/bfs/storyff/n221126qn2i92o9zf8m22h34kykxw0dl_firsti.jpg",
        "pub_location": "浙江",
        "cover43": "",
        "tidv2": 2030,
        "tnamev2": "颜值·网红舞",
        "pid_v2": 1004,
        "pid_name_v2": "舞蹈",
        "bvid": "BV1kP411u7jr",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 305593327,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      },
      {
        "aid": 114075187020133,
        "videos": 1,
        "tid": 256,
        "tname": "短片",
        "copyright": 1,
        "pic": "http://i1.hdslb.com/bfs/archive/3d3aaf0ab2da5e41f4de7ed3e7995babbfd1168a.jpg",
        "title": "中国人自己的保加利亚妖王",
        "pubdate": 1740649401,
        "ctime": 1740649401,
        "desc": "-",
        "state": 0,
        "duration": 53,
        "rights": {
          "bp": 0,
          "elec": 0,
          "download": 0,
          "movie": 0,
          "pay": 0,
          "hd5": 0,
          "no_reprint": 0,
          "autoplay": 1,
          "ugc_pay": 0,
          "is_cooperation": 0,
          "ugc_pay_preview": 0,
          "no_background": 0,
          "arc_pay": 0,
          "pay_free_watch": 0
        },
        "owner": {
          "mid": 1247190580,
          "name": "麦克瑟瑟大型纪录片",
          "face": "https://i1.hdslb.com/bfs/face/98df710e5e76e7fe37c0d5fd8047b899b21943d5.jpg"
        },
        "stat": {
          "aid": 114075187020133,
          "view": 9167,
          "danmaku": 1,
          "reply": 12,
          "favorite": 24,
          "coin": 2,
          "share": 9,
          "now_rank": 0,
          "his_rank": 0,
          "like": 166,
          "dislike": 0,
          "vt": 0,
          "vv": 9167,
          "fav_g": 0,
          "like_g": 0
        },
        "dynamic": "",
        "cid": 28602729880,
        "dimension": {
          "width": 1440,
          "height": 1080,
          "rotate": 0
        },
        "short_link_v2": "https://b23.tv/BV1Xg9cYYEDZ",
        "up_from_v2": 19,
        "first_frame": "http://i0.hdslb.com/bfs/storyff/n250227sao3m0apa1gc9g2yxt3vx2l53_firsti.jpg",
        "pub_location": "河南",
        "cover43": "",
        "tidv2": 2026,
        "tnamev2": "乐评盘点",
        "pid_v2": 1003,
        "pid_name_v2": "音乐",
        "bvid": "BV1Xg9cYYEDZ",
        "season_type": 0,
        "is_ogv": false,
        "ogv_info": null,
        "rcmd_reason": "",
        "enable_vt": 0,
        "ai_rcmd": {
          "id": 114075187020133,
          "goto": "av",
          "trackid": "web_related_0.router-related-2004712-fdb74c5f6-v6rmv.1744730526909.62",
          "uniq_id": ""
        }
      }
    ],
    "Spec": null,
    "hot_share": {
      "show": false,
      "list": []
    },
    "elec": null,
    "emergency": {
      "no_like": false,
      "no_coin": false,
      "no_fav": false,
      "no_share": false
    },
    "view_addit": {
      "63": false,
      "64": false,
      "69": false,
      "71": false,
      "72": false
    },
    "guide": null,
    "query_tags": null,
    "participle": [
      "保加利亚",
      "azis",
      "mv"
    ],
    "module_ctrl": null,
    "replace_recommend": false
  }
}
```

</details>

## 获取视频简介

> https://api.bilibili.com/x/web-interface/archive/desc

*请求方式：GET*

**url参数：**

| 参数名  | 类型  | 内容     | 必要性    | 备注            |
|------|-----|--------|--------|---------------|
| aid  | num | 稿件avid | 必要（可选） | avid与bvid任选一个 |
| bvid | str | 稿件bvid | 必要（可选） | avid与bvid任选一个 |

**json回复：**

根对象：

| 字段      | 类型  | 内容   | 备注                                   |
|---------|-----|------|--------------------------------------|
| code    | num | 返回值  | 0：成功<br />-400：请求错误<br />62002：稿件不可见 |
| message | str | 错误信息 | 默认为0                                 |
| ttl     | num | 1    |                                      |
| data    | str | 简介内容 |                                      |

**示例：**

查看视频(教主的咕鸽)`av39330059`/`BV1Bt411z799`的简介

avid方式：

```shell
curl -G 'https://api.bilibili.com/x/archive/desc' \
--data-urlencode 'aid=39330059'
```

bvid方式：

```shell
curl -G 'https://api.bilibili.com/x/archive/desc' \
--data-urlencode 'bvid=BV1Bt411z799'
```

<details>
<summary>查看响应示例：</summary>

```json
{
    "code": 0,
    "message": "0",
    "ttl": 1,
    "data": "1.小朋友们大家好，我是你们爷爷最喜欢的超威一列姆！\r\n2.在过去的一年里，我创作了无数脍炙人口的歌曲，常常被人夸赞高产似雌豚。\r\n3.接下来的日子里我会一如既往地勤勉创作，争取继续保持现在的产量，文体两开花。\r\n4.我感觉照这个势头和速度下去别说日常更新不在话下，连出张新专辑都指日可待了啊。\r\n5.也感谢你们一如既往的支持和鼓励，我会注意身体，不把自己累垮掉的。\r\n6.我个人不建议你们在评论区里艾特任何UP主，我真的不建议，当然你们非要这么做我也没办法的。"
}
```

</details>

## 查询视频分P列表 (avid/bvid转cid)

> https://api.bilibili.com/x/player/pagelist

*请求方式：GET*

**url参数：**

| 参数名  | 类型  | 内容     | 必要性    | 备注            |
|------|-----|--------|--------|---------------|
| aid  | num | 稿件avid | 必要（可选） | avid与bvid任选一个 |
| bvid | str | 稿件bvid | 必要（可选） | avid与bvid任选一个 |

**json回复：**

根对象：

| 字段      | 类型    | 内容   | 备注                                |
|---------|-------|------|-----------------------------------|
| code    | num   | 返回值  | 0：成功<br />-400：请求错误<br />-404：无视频 |
| message | str   | 错误信息 | 默认为0                              |
| ttl     | num   | 1    |                                   |
| data    | array | 分P列表 |                                   |

数组`data`：

| 项   | 类型  | 内容       | 备注      |
|-----|-----|----------|---------|
| 0   | obj | 1P内容     | 无分P仅有此项 |
| n   | obj | (n+1)P内容 |         |
| ……  | obj | ……       | ……      |

数组`data`中的对象：

| 字段          | 类型  | 内容        | 备注                                          |
|-------------|-----|-----------|---------------------------------------------|
| cid         | num | 当前分P cid  |                                             |
| page        | num | 当前分P      |                                             |
| from        | str | 视频来源      | vupload：普通上传（B站）<br />hunan：芒果TV<br />qq：腾讯 |
| part        | str | 当前分P标题    |                                             |
| duration    | num | 当前分P持续时间  | 单位为秒                                        |
| vid         | str | 站外视频vid   |                                             |
| weblink     | str | 站外视频跳转url |                                             |
| dimension   | obj | 当前分P分辨率   | 有部分视频无法获取分辨率                                |
| first_frame | str | 分P封面      |                                             |

数组`data`中的对象中的`dimension`对象：

| 字段     | 类型  | 内容      | 备注             |
|--------|-----|---------|----------------|
| width  | num | 当前分P 宽度 |                |
| height | num | 当前分P 高度 |                |
| rotate | num | 是否将宽高对换 | 0：正常<br />1：对换 |

**示例：**

查询视频`av13502509`/`BV1ex411J7GE`的分P列表

avid方式：

```shell
curl -G 'https://api.bilibili.com/x/player/pagelist' \
--data-urlencode 'aid=13502509'
```

bvid方式：

```shell
curl -G 'https://api.bilibili.com/x/player/pagelist' \
--data-urlencode 'bvid=BV1ex411J7GE'
```

<details>
<summary>查看响应示例：</summary>

```json
{
    "code": 0,
    "message": "0",
    "ttl": 1,
    "data": [{
        "cid": 66445301,
        "page": 1,
        "from": "vupload",
        "part": "00. 宣传短片",
        "duration": 33,
        "vid": "",
        "weblink": "",
        "dimension": {
            "width": 1920,
            "height": 1080,
            "rotate": 0
        }
    }, {
        "cid": 35039663,
        "page": 2,
        "from": "vupload",
        "part": "01. 火柴人与动画师",
        "duration": 133,
        "vid": "",
        "weblink": "",
        "dimension": {
            "width": 1484,
            "height": 1080,
            "rotate": 0
        }
    }, {
        "cid": 35039678,
        "page": 3,
        "from": "vupload",
        "part": "02. 火柴人与动画师 II",
        "duration": 210,
        "vid": "",
        "weblink": "",
        "dimension": {
            "width": 1484,
            "height": 1080,
            "rotate": 0
        }
    }, {
        "cid": 35039693,
        "page": 4,
        "from": "vupload",
        "part": "03. 火柴人与动画师 III",
        "duration": 503,
        "vid": "",
        "weblink": "",
        "dimension": {
            "width": 992,
            "height": 720,
            "rotate": 0
        }
    }]
}
```

</details>


# video/player.md

# 播放器

## web 播放器信息

web 播放器的信息接口，提供正常播放需要的元数据，包括：智能防挡弹幕、字幕、章节看点等。

> https://api.bilibili.com/x/player/wbi/v2  
> https://api.bilibili.com/x/player/v2

*请求方式：GET*

**URL参数:**

| 参数名 | 类型 | 内容      | 必要性      | 备注              |
| ------ | ---- | --------- | ----------- | ----------------- |
| aid    | num  | 稿件 avid | 必要 (可选) | aid 与 bvid 任选 |
| bvid   | str  | 稿件 bvid | 必要 (可选) | aid 与 bvid 任选 |
| cid    | num  | 稿件 cid | 必要 | |
| season_id | num | 番剧 season_id | 不必要 | |
| ep_id | num | 剧集 ep_id | 不必要 | |
| w_rid | str  | WBI 签名 | 不必要 |  |
| wts   | num  | 当前 unix 时间戳 | 不必要 |  |

**JSON回复:**

根对象:

| 字段    | 类型 | 内容     | 备注                        |
| ------- | ---- | -------- | --------------------------- |
| code    | num  | 返回值   | 0: 成功<br />-400: 请求错误 |
| message | str  | 错误信息 | 默认为 0                     |
| ttl     | num  | 1        |                             |
| data    | obj  | 数据本体 |                             |

`data` 对象:

| 字段      | 类型  | 内容     | 备注 |
| --------- | ----- | -------- | ---- |
| aid        | num  | 视频 aid   |      |
| bvid       | str  | 视频 bvid  |      |
| allow_bp   | bool |  |  |
| no_share   | bool | 禁止分享? |  |
| cid        | num  | 视频 cid   |      |
| dm_mask    | obj  | webmask 防挡字幕信息 | 若无则没有防挡功能 |
| subtitle   | obj  | 字幕信息 | 若无则没有字幕, 若不登陆则为空 |
| view_points | array  | 分段章节信息 |  |
| ip_info    | obj  | 请求 IP 信息 |      |
| login_mid  | num  | 登录用户 mid |      |
| login_mid_hash | str |  |  |
| is_owner | bool | 是否为该视频 UP 主 |  |
| name       | str  |  |  |
| permission | num  |  |  |
| level_info | obj  | 登录用户等级信息 |  |
| vip        | obj  | 登录用户 VIP 信息 |  |
| answer_status | num | 答题状态 |  |
| block_time | num | 封禁时间? |  |
| role | str |  |  |
| last_play_time | num | 上次观看时间? |  |
| last_play_cid | num | 上次观看 cid? |  |
| now_time | num | 当前 UNIX 秒级时间戳 |  |
| online_count | num | 在线人数 |  |
| need_login_subtitle | bool | 是否必须登陆才能查看字幕 | 是的 |
| preview_toast | str | `为创作付费，购买观看完整视频\|购买观看` |  |
| interaction | obj | 互动视频资讯 | 若非互动视频，则无该栏位（直接没有该键，而非栏位值为空）|
| options | obj |  |  |
| guide_attention | any |  |  |
| jump_card | any |  |  |
| operation_card | any |  |  |
| online_switch | obj |  |  |
| fawkes | obj | 播放器相关信息? |  |
| show_switch | obj |  |  |
| bgm_info | obj | 背景音乐信息 |  |
| toast_block | bool |  |  |
| is_upower_exclusive | bool | 是否为充电专属视频 |  |
| is_upower_play | bool |  |  |
| is_ugc_pay_preview | bool |  |  |
| elec_high_level | obj | 充电专属视频信息 |  |
| disable_show_up_info | bool |  |  |

`data` 对象中的 `options` 对象:

| 字段 | 类型 | 内容 | 备注 |
| ---- | ---- | --- | --- |
| is_360 | bool | 是否 360 全景视频 |  |
| without_vip | bool |  |  |

`data` 对象中的 `bgm_info` 对象:

| 字段 | 类型 | 内容 | 备注 |
| --- | --- | --- | --- |
| music_id | str | 音乐 id |  |
| music_title | str | 音乐标题 |  |
| jump_url | str | 跳转 URL |  |

`data` 对象中的 `dm_mask` 对象 (如果有):

| 字段      | 类型  | 内容     | 备注 |
| --------- | ----- | -------- | ---- |
|cid        | num  |  视频 cid   |      |
|plat       | num  | 未知   |      |
|fps       | num  | webmask 取样 fps   |      |
|time       | num  | 未知   |      |
|mask_url   | str  |  webmask 资源 url |  |

解析 webmask 请看 [智能防挡弹幕](../danmaku/webmask.md)

`data` 对象中的 `subtitle` 对象:

| 字段      | 类型  | 内容     | 备注 |
| --------- | ----- | -------- | ---- |
|allow_submit|bool | true   |      |
|  lan      |  str | ""          |      |
|lan_doc | str | ""    | |
|subtitles| array |  | 不登录为 `[]` |

`subtitle` 对象中的 `subtitles` 数组内的元素:

| 字段      | 类型  | 内容     | 备注 |
| --------- | ----- | -------- | ---- |
| ai_status | num  |    |      |
| ai_type   | num  |    |   |
| id  | num | | |
|id_str | str| | 和 id 不一样 |
| is_lock | bool | | |
| lan | str | 语言类型英文字母缩写 ||
| lan_doc | str| 语言类型中文名称 | |
|subtitle_url|str| 资源 url 地址 | |
|type| num | 0 | |

`data`对象中的`view_point` 数组内的元素:

| 字段      | 类型  | 内容     | 备注 |
| --------- | ----- | -------- | ---- |
| content | str  |  分段章节名  |      |
| from | num  |  分段章节起始秒数  |      |
| to | num  |  分段章节结束秒数  |      |
| type | num  |    |      |
| imgUrl | str  |  图片资源地址  |      |
| logoUrl | str  |  ""  |      |
| team_type | str  |    |      |
| team_name | str  |    |      |

`data` 对象中的 `interaction` 对象 (如果有):

| 字段      | 类型  | 内容     | 备注 |
| --------- | ----- | -------- | ---- |
| graph_version | num | 剧情图id |   |
| msg | str |  | 未登入有机会返回 `登录后才能体验全部结局哦～` |
| error_toast | str | 错误信息？ | 所有互动视频皆返回 `剧情图被修改已失效`，不确定有没有例外 |
| mark | num | 0? |   |
| need_reload | num | 0? |   |

`data`对象中的`elec_high_level`对象：

| 字段           | 类型 | 内容                           | 备注             |
| -------------- | ---- | ------------------------------ | ---------------- |
| privilege_type | num  | 解锁视频所需最低定价档位的代码 | 见[充电档位代码与定价](../electric/monthly.md#充电档位代码privilege_type与定价) |
| title          | str  | 提示标题                       | `该视频为「{充电档位名称}」专属视频` |
| sub_title      | str  | 提示子标题                     | `开通「{充电档位定价}元档包月充电」即可观看` |
| show_button    | bool | 是否显示按钮                   |                  |
| button_text    | str  | 按钮文本                       | `去开通`         |
| jump_url       | obj  | 跳转url信息                    | 详细信息有待补充 |
| intro          | str  | 充电介绍语                     |                  |
| open           | bool | （？）                         |                  |
| new            | bool | （？）                         |                  |
| question_text  | str  | （？）                         |                  |
| qa_detail_link | str  | （？）                         |                  |

**示例:**

未登录, `aid=1906473802`

```shell
curl -G 'https://api.bilibili.com/x/player/wbi/v2' \
--url-query 'bvid=BV1MU411S7iJ' \
--url-query 'aid=1906473802' \
--url-query 'cid=1625992822'
```

<details>
<summary>查看响应示例:</summary>

```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "aid": 1906473802,
    "bvid": "BV1MU411S7iJ",
    "allow_bp": false,
    "no_share": false,
    "cid": 1625992822,
    "max_limit": 1000,
    "page_no": 1,
    "has_next": false,
    "ip_info": {
      "ip": "104.28.152.138",
      "zone_ip": " 10.163.150.25",
      "zone_id": 29409280,
      "country": "美国",
      "province": "加利福尼亚州",
      "city": "东洛杉矶"
    },
    "login_mid": 0,
    "login_mid_hash": "",
    "is_owner": false,
    "name": "",
    "permission": "0",
    "level_info": {
      "current_level": 0,
      "current_min": 0,
      "current_exp": 0,
      "next_exp": 0,
      "level_up": 0
    },
    "vip": {
      "type": 0,
      "status": 0,
      "due_date": 0,
      "vip_pay_type": 0,
      "theme_type": 0,
      "label": {
        "path": "",
        "text": "",
        "label_theme": "",
        "text_color": "",
        "bg_style": 0,
        "bg_color": "",
        "border_color": "",
        "use_img_label": false,
        "img_label_uri_hans": "",
        "img_label_uri_hant": "",
        "img_label_uri_hans_static": "",
        "img_label_uri_hant_static": ""
      },
      "avatar_subscript": 0,
      "nickname_color": "",
      "role": 0,
      "avatar_subscript_url": "",
      "tv_vip_status": 0,
      "tv_vip_pay_type": 0,
      "tv_due_date": 0,
      "avatar_icon": {
        "icon_resource": {}
      }
    },
    "answer_status": 0,
    "block_time": 0,
    "role": "",
    "last_play_time": 0,
    "last_play_cid": 0,
    "now_time": 1725002188,
    "online_count": 1,
    "need_login_subtitle": false,
    "view_points": [],
    "preview_toast": "为创作付费，购买观看完整视频|购买观看",
    "options": {
      "is_360": false,
      "without_vip": false
    },
    "guide_attention": [],
    "jump_card": [],
    "operation_card": [],
    "online_switch": {
      "enable_gray_dash_playback": "500",
      "new_broadcast": "1",
      "realtime_dm": "1",
      "subtitle_submit_switch": "1"
    },
    "fawkes": {
      "config_version": 30787,
      "ff_version": 21289
    },
    "show_switch": {
      "long_progress": false
    },
    "bgm_info": {
      "music_id": "MA436038343856245020",
      "music_title": "Unwelcome school",
      "jump_url": "https://music.bilibili.com/h5/music-detail?music_id=MA436038343856245020&cid=1625992822&aid=1906473802"
    },
    "toast_block": false,
    "is_upower_exclusive": false,
    "is_upower_play": false,
    "is_ugc_pay_preview": false,
    "elec_high_level": {
      "privilege_type": 0,
      "title": "",
      "sub_title": "",
      "show_button": false,
      "button_text": "",
      "jump_url": "",
      "intro": "",
      "new": false
    },
    "disable_show_up_info": false
  }
}
```

</details>

已登陆, `aid=60977932`

```shell
curl -G 'https://api.bilibili.com/x/player/v2' \
--url-query 'aid=60977932' \
--url-query 'cid=106101299' \
-b 'SESSDATA=xxx'
```

<details>
<summary>查看响应示例:</summary>

```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "aid": 60977932,
    "bvid": "BV1Jt411P77c",
    "allow_bp": false,
    "no_share": false,
    "cid": 106101299,
    "max_limit": 1000,
    "page_no": 1,
    "has_next": true,
    "ip_info": {
      "ip": "108.181.22.55",
      "zone_ip": " 172.27.132.5",
      "zone_id": 29409296,
      "country": "美国",
      "province": "加利福尼亚州",
      "city": "洛杉矶"
    },
    "login_mid": 616368979,
    "login_mid_hash": "445e7035",
    "is_owner": false,
    "name": "淡紫玲儿",
    "permission": "10000,1001",
    "level_info": {
      "current_level": 3,
      "current_min": 1500,
      "current_exp": 2962,
      "next_exp": 4500,
      "level_up": -62135596800
    },
    "vip": {
      "type": 1,
      "status": 0,
      "due_date": 1665417600000,
      "vip_pay_type": 0,
      "theme_type": 0,
      "label": {
        "path": "",
        "text": "",
        "label_theme": "",
        "text_color": "",
        "bg_style": 0,
        "bg_color": "",
        "border_color": "",
        "use_img_label": true,
        "img_label_uri_hans": "",
        "img_label_uri_hant": "",
        "img_label_uri_hans_static": "https://i0.hdslb.com/bfs/vip/d7b702ef65a976b20ed854cbd04cb9e27341bb79.png",
        "img_label_uri_hant_static": "https://i0.hdslb.com/bfs/activity-plat/static/20220614/e369244d0b14644f5e1a06431e22a4d5/KJunwh19T5.png"
      },
      "avatar_subscript": 0,
      "nickname_color": "",
      "role": 0,
      "avatar_subscript_url": "",
      "tv_vip_status": 0,
      "tv_vip_pay_type": 0,
      "tv_due_date": 0,
      "avatar_icon": {
        "icon_resource": {}
      }
    },
    "answer_status": 0,
    "block_time": 0,
    "role": "0",
    "last_play_time": 0,
    "last_play_cid": 0,
    "now_time": 1725003260,
    "online_count": 1,
    "need_login_subtitle": false,
    "subtitle": {
      "allow_submit": true,
      "lan": "zh-CN",
      "lan_doc": "中文（中国）",
      "subtitles": [
        {
          "id": 13643112644608002,
          "lan": "zh-Hans",
          "lan_doc": "中文（简体）",
          "is_lock": true,
          "subtitle_url": "//aisubtitle.hdslb.com/bfs/subtitle/c49b18a284739d99df1e3723cdf72c0c82db98e0.json?auth_key=1725003260-5d0391a07f4f47f6960f60cf5045dff3-0-fc16c1f67a6b41edcb2a89d5e0c9bfdd",
          "type": 0,
          "id_str": "13643112644608002",
          "ai_type": 0,
          "ai_status": 0
        },
        {
          "id": 13643200114196484,
          "lan": "en-US",
          "lan_doc": "英语（美国）",
          "is_lock": true,
          "subtitle_url": "//aisubtitle.hdslb.com/bfs/subtitle/2b38bc0f5d7671176964d4c3de441ed37568500c.json?auth_key=1725003260-5f709a74aa884751b77f86b6f6a48078-0-9b2fc3c18b99b1bf0cc7c7e63d18f686",
          "type": 0,
          "id_str": "13643200114196484",
          "ai_type": 0,
          "ai_status": 0
        }
      ]
    },
    "view_points": [],
    "preview_toast": "为创作付费，购买观看完整视频|购买观看",
    "options": {
      "is_360": false,
      "without_vip": false
    },
    "guide_attention": [],
    "jump_card": [],
    "operation_card": [],
    "online_switch": {
      "enable_gray_dash_playback": "500",
      "new_broadcast": "1",
      "realtime_dm": "1",
      "subtitle_submit_switch": "1"
    },
    "fawkes": {
      "config_version": 30787,
      "ff_version": 21289
    },
    "show_switch": {
      "long_progress": false
    },
    "bgm_info": null,
    "toast_block": false,
    "is_upower_exclusive": false,
    "is_upower_play": false,
    "is_ugc_pay_preview": false,
    "elec_high_level": {
      "privilege_type": 0,
      "title": "",
      "sub_title": "",
      "show_button": false,
      "button_text": "",
      "jump_url": "",
      "intro": "",
      "new": false
    },
    "disable_show_up_info": false
  }
}
```

</details>

## 播放反馈

> https://app.bilibili.com/x/resource/laser2

*请求方式: POST*

注: 该接口不传 Cookie

**URL参数:**

|参数名|类型|内容|必要性|备注|
|-|-|-|-|-|
|mid|num|当前用户 mid|不必要|未登录为空|
|buvid|str|BUVID (APP) 或 buvid3 (Web)|必要|可为任意非空字符串|
|app_key|str|APP 密钥|必要|Web: web_player<br />可为任意非空字符串|
|url|str|日志 URL|非必要|从 [上传接口](../creativecenter/upload.md#上传接口) 得到的 upos 协议 URL|
|task_type|num|任务类型|非必要|300: 播放卡顿<br />301: 进度条君无法调戏<br />354: 校园网无法访问<br />303: 弹幕无法显示<br />553: 跳过首尾时间有误<br />304: 出现浮窗广告<br />305: 无限小电视<br />302: 音画不同步<br />306: 黑屏<br />307: 其他|

**JSON回复:**

|字段|类型|内容|备注|
|-|-|-|-|
|code|num|返回值|0: 成功<br />-400: 请求错误|
|message|str|错误信息|默认为 0|
|ttl|num|1||
|data|obj|数据本体| |

`data` 对象:

|字段|类型|内容|备注|
|-|-|-|-|
|task_id|num|任务 ID?||

**示例:**

播放反馈无限小电视, 不登录, 不传文件, buvid 为 `chenrui-in-icu`

```shell
curl -X POST "https://app.bilibili.com/x/resource/laser2" \
--data-urlencode "buvid=chenrui-in-icu" \
--data-urlencode "app_key=web_player" \
--data-urlencode "task_type=305"
```

<details>
<summary>查看响应示例:</summary>

```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "task_id": 850448532
  }
}
```

</details>


# video/videostream_url.md

# 视频流URL

<img src="../../assets/img/download.svg" width="100" height="100"/>

视频为 DASH 或 MP4 流媒体，需调用取流 API 传参视频 id 获取

## qn视频清晰度标识

注：该值在 DASH 格式下无效，因为 DASH 格式会取到所有分辨率的流地址

又注: B站对于新的视频更新了播放设置, 较高分辨率均采用 DASH, 较低分辨率与老视频还保留了 MP4, 这导致较新视频无法获取 MP4 格式的高分辨率视频, 参见 [#606](https://github.com/SocialSisterYi/bilibili-API-collect/issues/606) 或 [cv949156](https://www.bilibili.com/read/cv949156/)

| 值   | 含义           | 备注                                                         |
| ---- | -------------- | ------------------------------------------------------------ |
| 6    | 240P 极速      | 仅 MP4 格式支持<br />仅`platform=html5`时有效                |
| 16   | 360P 流畅      |                                                              |
| 32   | 480P 清晰      |                                                              |
| 64   | 720P 高清      | WEB 端默认值<br />**无 720P 时则为 720P60** |
| 74   | 720P60 高帧率  | 登录认证                                                     |
| 80   | 1080P 高清     | TV 端与 APP 端默认值<br />登录认证                           |
| 100  | 智能修复       | 人工智能增强画质<br />大会员认证
| 112  | 1080P+ 高码率  | 大会员认证                                                   |
| 116  | 1080P60 高帧率 | 大会员认证                                                   |
| 120  | 4K 超清        | 需要`fnval&128=128`且`fourk=1`<br />大会员认证               |
| 125  | HDR 真彩色     | 仅支持 DASH 格式<br />需要`fnval&64=64`<br />大会员认证      |
| 126  | 杜比视界       | 仅支持 DASH 格式<br />需要`fnval&512=512`<br />大会员认证    |
| 127  | 8K 超高清      | 仅支持 DASH 格式<br />需要`fnval&1024=1024`<br />大会员认证  |
| 129 | HDR Vivid | 大会员认证 |

例如：请求 1080P+ 的视频，则`qn=112`

## fnver视频流版本标识

目前该值恒为 0，即`fnver=0`

## fnval视频流格式标识

该代码为二进制属性位，如需组合功能需要使用`OR`运算结合一下数值

目前 FLV 格式已下线，应避免使用`fnval=0`

| 值   | 含义               | 备注                                                         |
| ---- | ------------------ | ------------------------------------------------------------ |
| 1    | MP4 格式        | 仅 H.264 编码<br />与 DASH 格式互斥 |
| 16   | DASH 格式      | 与 MP4 格式互斥 |
| 64   | 是否需求 HDR 视频 | 需求 DASH 格式<br />仅 H.265 编码<br />需要`qn=125`<br />大会员认证 |
| 128  | 是否需求 4K 分辨率 | 该值与`fourk`字段协同作用<br />需要`qn=120`<br />大会员认证 |
| 256  | 是否需求杜比音频   | 需求 DASH 格式<br />大会员认证 |
| 512  | 是否需求杜比视界   | 需求 DASH 格式<br />大会员认证 |
| 1024 | 是否需求 8K 分辨率 | 需求 DASH 格式<br />需要`qn=127`<br />大会员认证 |
| 2048 | 是否需求 AV1 编码 | 需求 DASH 格式                                       |
| 4048 | 所有可用 DASH 视频流 | 即一次性返回所有可用 DASH 格式视频流 |
| 16384 | 是否需要 HDR Vivid | 需要`qn=129`<br />大会员认证<br />仅 APP 接口可用 |

例如：请求 DASH 格式，且需要 HDR 的视频流，则`fnval=16|64=80`

## 视频编码代码

| 值 | 含义     | 备注           |
| ---- | ---------- | ---------------- |
| 7  | AVC 编码 | 8K 视频不支持该格式 |
| 12 | HEVC 编码 |                |
| 13 | AV1 编码 |                |

## 视频伴音音质代码

| 值    | 含义 |
| ----- | ---- |
| 30216 | 64K  |
| 30232 | 132K |
| 30280 | 192K |
| 30250 | 杜比全景声 |
| 30251 | Hi-Res无损 |

## 获取视频流地址_web端

> https://api.bilibili.com/x/player/wbi/playurl



*请求方式：GET*

认证方式：Cookie（SESSDATA）

鉴权方式：[Wbi 签名](../misc/sign/wbi.md)

---

关于视频流会员鉴权：

- 获取 720P 及以上清晰度视频时需要登录（Cookie）

- 获取高帧率（1080P60）/ 高码率（1080P+）/ HDR / 杜比视界 视频时需要有大会员的账号登录（Cookie）

- 获取会员专属视频时需要登录（Cookie）

- 部分特殊视频（如平台宣传片、活动视频等）不需要大会员账号认证

---

获取 url 有效时间为 120min，超时失效需要重新获取

FLV 格式已下线，不可能出现分段

若视频有分P，仅为单P视频的 url，换P则需传参对应 CID 重新获取

**url参数：**

| 参数名 | 类型 | 内容             | 必要性       | 备注                                                         |
| ------ | ---- | ---------------- | ------------ | ------------------------------------------------------------ |
| avid   | num  | 稿件 avid        | 必要（可选） | avid 与 bvid 任选一个                                        |
| bvid   | str  | 稿件 bvid        | 必要（可选） | avid 与 bvid 任选一个                                        |
| cid    | num  | 视频 cid         | 必要         |                                                              |
| gaia_source   | str  | view-card<br />pre-load  | 必要(非必要)         | 有Cookie(SESSDATA)时无需此参数<br />暂未找到两个内容值区别                                      |
| isGaiaAvoided| bool| true/false| 非必要|未知作用                                                            |
| qn     | num  | 视频清晰度选择   | 非必要       | 未登录默认 32（480P），登录后默认 64（720P）<br />含义见 [上表](#qn视频清晰度标识)<br />**DASH 格式时无效** |
| fnval  | num  | 视频流格式标识 | 非必要       | 默认值为`1`（MP4 格式）<br />含义见 [上表](#fnval视频流格式标识) |
| fnver  | num  | 0                | 非必要       |                                                       |
| fourk  | num  | 是否允许 4K 视频 | 非必要       | 画质最高 1080P：0（默认）<br />画质最高 4K：1       |
| session  | str  |    | 非必要       | 从视频播放页的 HTML 中设置 window.\_\_playinfo\_\_ 处获取，或者通过 buvid3 +  当前UNIX毫秒级时间戳 经过md5获取     |
| otype  | str  |    | 非必要       | 固定为`json`           |
| type  | str  |    | 非必要       | 目前为空             |
| platform | str |    | 非必要 | pc：web播放（默认值，视频流存在 referer鉴权）<br />html5：移动端 HTML5 播放（仅支持 MP4 格式，无 referer 鉴权可以直接使用`video`标签播放） |
| high_quality | num | 是否高画质 | 非必要 | platform=html5时，此值为1可使画质为1080p |
| try_look | num | 未登录高画质 | 非必要 | 为 `1` 时可以不登录拉到 `64` 和 `80` 清晰度 |

**json回复：**

根对象：

| 字段    | 类型                          | 内容     | 备注                                           |
| ------- | ----------------------------- | -------- | ---------------------------------------------- |
| code    | num                           | 返回值   | 0：成功 <br />-400：请求错误<br />-404：无视频 |
| message | str                           | 错误信息 | 默认为0                                        |
| ttl     | num                           | 1        |                                                |
| data    | 有效时：obj<br />无效时：null | 数据本体 |                                                |

`data`对象：

| 字段               | 类型  | 内容                                            | 备注                                            |
| ------------------ | ----- | ----------------------------------------------- | ----------------------------------------------- |
| v_voucher          | str   | (?)                                            | 需要参数`gaia_source`                     |
| from               | str   | `local`？                                       |                                                 |
| result             | str   | `suee`？                                        |                                                 |
| message            | str   | 空？                                            |                                                 |
| quality            | num   | 清晰度标识                                      | 含义见 [上表](#qn视频清晰度标识)                |
| format             | str   | 视频格式                                        | `mp4`/`flv`                                     |
| timelength         | num   | 视频长度                                        | 单位为毫秒<br />不同分辨率 / 格式可能有略微差异 |
| accept_format      | str   | 支持的全部格式                                  | 每项用`,`分隔                                   |
| accept_description | array | 支持的清晰度列表（文字说明）                    |                                                 |
| accept_quality     | array | 支持的清晰度列表（代码）                        | 含义见 [上表](#qn视频清晰度标识)                |
| video_codecid      | num   | 默认选择视频流的编码id                          | 含义见 [上表](#视频编码代码)                    |
| seek_param         | str   | `start`？                                       |                                                 |
| seek_type          | str   | `offset`（DASH / FLV）？<br/> `second`（MP4）？ |                                                 |
| durl               | array | 视频分段流信息                                  | **注：仅 FLV / MP4 格式存在此字段**             |
| dash               | obj   | DASH 流信息                                     | **注：仅 DASH 格式存在此字段**                  |
| support_formats    | array | 支持格式的详细信息                              |                                                 |
| high_format        | null  | （？）                                          |                                                 |
| last_play_time     | num   | 上次播放进度                                    | 毫秒值                                          |
| last_play_cid      | num   | 上次播放分P的 cid                               |                                                 |

`data`中的`accept_description`数组：

| 项   | 类型 | 内容            | 备注 |
| ---- | ---- | --------------- | ---- |
| 0    | str  | 分辨率名称1     |      |
| n    | str  | 分辨率名称(n+1) |      |
| ……   | str  | ……              |      |

`data`中的`accept_quality`数组：

| 项   | 类型 | 内容            | 备注                             |
| ---- | ---- | --------------- | -------------------------------- |
| 0    | num  | 分辨率代码1     | 含义见 [上表](#qn视频清晰度标识) |
| n    | num  | 分辨率代码(n+1) |                                  |
| ……   | num  | ……              |                                  |

`data`中的`support_formats`数组：

| 项   | 类型 | 内容            | 备注 |
| ---- | ---- | --------------- | ---- |
| 0    | obj  | 播放格式详细信息1     |      |
| n    | obj  | 播放格式详细信息(n+1) |      |
| ……   | obj  | ……              |      |

`support_formats`数组中的对象：

| 字段       | 类型   | 内容         | 备注                               |
| ---------- | ------ | ------------ | ---------------------------------- |
| quality      | num    | 视频清晰度代码 | 含义见 [上表](#qn视频清晰度标识) |
| format     | str    | 视频格式     |                          |
| new_description       | str    | 格式描述     |                          |
| display_desc      | str    | 格式描述           |                        |
| superscript      | str    | (?)           |                        |
| codecs        | array    | 可用编码格式列表    |  |

`support_formats`中的`codecs`数组：

| 项   | 类型 | 内容            | 备注 |
| ---- | ---- | --------------- | ---- |
| 0    | str  |  例：av01.0.13M.08.0.110.01.01.01.0    |  使用AV1编码    |
| 1    | str  | 例子：avc1.640034  |   使用AVC编码   |
| 2    | str  | 例子：hev1.1.6.L153.90 |   使用HEVC编码   |

由于 MP4 与 DASH 格式的返回结构不同，以下内容需要分类讨论`durl`与`dash`字段的内容


---

### FLV/MP4格式

`data`中的`durl`数组：

| 项   | 类型 | 内容              | 备注                      |
| ---- | ---- | ----------------- | ------------------------- |
| 0    | obj  | 视频分段 1 信息   | **目前由于 FLV 格式已经下线，不会存在分段现象，故无需关心** |
| n    | obj  | 视频分段 (n+1) 信息 |                           |
| ……   | obj  | ……                |                           |

`durl`数组中的对象：

| 字段       | 类型   | 内容         | 备注                               |
| ---------- | ------ | ------------ | ---------------------------------- |
| order      | num    | 视频分段序号 | 某些视频会分为多个片段（从1顺序增长）     |
| length     | num    | 视频长度     | 单位为毫秒                         |
| size       | num    | 视频大小     | 单位为 Byte                        |
| ahead      | str    | （？）        |                        |
| vhead      | str    | （？）        |                        |
| url        | str    | 默认流 URL | **注意 unicode 转义符**<br />有效时间为120min |
| backup_url | array | 备用视频流   |                                    |

`durl`数组中的对象中的`backup_url`数组：

| 项   | 类型 | 内容             | 备注                                          |
| ---- | ---- | ---------------- | --------------------------------------------- |
| 0    | str  | 备用流 URL 1     | **注意 unicode 转义符**<br />有效时间为120min |
| n    | str  | 备用流 URL (n+1) |                                               |
| ……   | str  | ……               |                                               |

**示例：**

**视频无分段时：**

获取视频`av99999999`/`BV1y7411Q7Eq`中的 1P（cid=`171776208`）的视频流 URL，清晰度为 1080P+，使用 FLV 方式获取

avid方式：

```shell
curl -G 'https://api.bilibili.com/x/player/playurl' \
    --data-urlencode 'avid=99999999' \
    --data-urlencode 'cid=171776208' \
    --data-urlencode 'qn=112' \
    --data-urlencode 'fnval=0' \
    --data-urlencode 'fnver=0' \
    --data-urlencode 'fourk=1' \
    -b 'SESSDATA=xxx'
```

 bvid方式：

```shell
curl -G 'https://api.bilibili.com/x/player/playurl' \
    --data-urlencode 'bvid=BV1y7411Q7Eq' \
    --data-urlencode 'cid=171776208' \
    --data-urlencode 'qn=112' \
    --data-urlencode 'fnval=0' \
    --data-urlencode 'fnver=0' \
    --data-urlencode 'fourk=1' \
    -b 'SESSDATA=xxx'
```

<details>
<summary>查看响应示例：</summary>

```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "from": "local",
    "result": "suee",
    "message": "",
    "quality": 64,
    "format": "flv720",
    "timelength": 283801,
    "accept_format": "hdflv2,flv,flv720,flv480,mp4",
    "accept_description": [
      "高清 1080P+",
      "高清 1080P",
      "高清 720P",
      "清晰 480P",
      "流畅 360P"
    ],
    "accept_quality": [
      112,
      80,
      64,
      32,
      16
    ],
    "video_codecid": 7,
    "seek_param": "start",
    "seek_type": "offset",
    "durl": [
      {
        "order": 1,
        "length": 283801,
        "size": 70486426,
        "ahead": "",
        "vhead": "",
        "url": "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/08/62/171776208/171776208_nb2-1-64.flv?e=ig8euxZM2rNcNbNMnwdVhwdlhbK3hwdVhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1662808778&gen=playurlv2&os=cosbv&oi=3719461929&trid=31dc1934e77141bfbdf5ae88aca0b29fu&mid=0&platform=pc&upsig=a4d5f1713e1ba313041d034a958c2414&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,mid,platform&bvc=vod&nettype=0&orderid=0,3&agrr=1&bw=249068&logo=80000000",
        "backup_url": [
          "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/08/62/171776208/171776208_nb2-1-64.flv?e=ig8euxZM2rNcNbNMnwdVhwdlhbK3hwdVhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1662808778&gen=playurlv2&os=cosbv&oi=3719461929&trid=31dc1934e77141bfbdf5ae88aca0b29fu&mid=0&platform=pc&upsig=a4d5f1713e1ba313041d034a958c2414&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,mid,platform&bvc=vod&nettype=0&orderid=1,3&agrr=1&bw=249068&logo=40000000",
          "https://upos-sz-mirrorcosb.bilivideo.com/upgcxcode/08/62/171776208/171776208_nb2-1-64.flv?e=ig8euxZM2rNcNbNMnwdVhwdlhbK3hwdVhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1662808778&gen=playurlv2&os=cosbbv&oi=3719461929&trid=31dc1934e77141bfbdf5ae88aca0b29fu&mid=0&platform=pc&upsig=7b8a6924948864944815ec0748cc108f&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,mid,platform&bvc=vod&nettype=0&orderid=2,3&agrr=1&bw=249068&logo=40000000"
        ]
      }
    ],
    "support_formats": [
      {
        "quality": 112,
        "format": "hdflv2",
        "new_description": "1080P 高码率",
        "display_desc": "1080P",
        "superscript": "高码率",
        "codecs": null
      },
      {
        "quality": 80,
        "format": "flv",
        "new_description": "1080P 高清",
        "display_desc": "1080P",
        "superscript": "",
        "codecs": null
      },
      {
        "quality": 64,
        "format": "flv720",
        "new_description": "720P 高清",
        "display_desc": "720P",
        "superscript": "",
        "codecs": null
      },
      {
        "quality": 32,
        "format": "flv480",
        "new_description": "480P 清晰",
        "display_desc": "480P",
        "superscript": "",
        "codecs": null
      },
      {
        "quality": 16,
        "format": "mp4",
        "new_description": "360P 流畅",
        "display_desc": "360P",
        "superscript": "",
        "codecs": null
      }
    ],
    "high_format": null,
    "last_play_time": 0,
    "last_play_cid": 0
  }
}
```

</details>

**视频有分段时：**

以下内容无参考价值，仅做历史保存

<details>
<summary>查看响应示例：</summary>

```json
{
    "code": 0,
    "message": "0",
    "ttl": 1,
    "data": {
        "from": "local",
        "result": "suee",
        "message": "",
        "quality": 16,
        "format": "flv360",
        "timelength": 1437918,
        "accept_format": "flv,flv720,flv480,flv360",
        "accept_description": [
            "高清 1080P",
            "高清 720P",
            "清晰 480P",
            "流畅 360P"
        ],
        "accept_quality": [
            80,
            64,
            32,
            16
        ],
        "video_codecid": 7,
        "seek_param": "start",
        "seek_type": "offset",
        "durl": [
            {
                "order": 1,
                "length": 364417,
                "size": 23018310,
                "ahead": "",
                "vhead": "",
                "url": "http://upos-sz-mirrorhw.bilivideo.com/upgcxcode/98/24/872498/872498-1-15.flv?e=ig8euxZM2rNcNbRB7zUVhoM17WuBhwdEto8g5X10ugNcXBlqNxHxNEVE5XREto8KqJZHUa6m5J0SqE85tZvEuENvNo8g2ENvNo8i8o859r1qXg8xNEVE5XREto8GuFGv2U7SuxI72X6fTr859r1qXg8gNEVE5XREto8z5JZC2X2gkX5L5F1eTX1jkXlsTXHeux_f2o859IB_&uipk=5&nbs=1&deadline=1589874109&gen=playurl&os=hwbv&oi=1965551630&trid=ceac015d41e04a7b90ec972db710524fu&platform=pc&upsig=f99db2dc9b8c65c245515b29b9ca8b16&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&mid=293793435&logo=80000000",
                "backup_url": [
                    "http://upos-sz-mirrorks3c.bilivideo.com/upgcxcode/98/24/872498/872498-1-15.flv?e=ig8euxZM2rNcNbRB7zUVhoM17WuBhwdEto8g5X10ugNcXBlqNxHxNEVE5XREto8KqJZHUa6m5J0SqE85tZvEuENvNo8g2ENvNo8i8o859r1qXg8xNEVE5XREto8GuFGv2U7SuxI72X6fTr859r1qXg8gNEVE5XREto8z5JZC2X2gkX5L5F1eTX1jkXlsTXHeux_f2o859IB_&uipk=5&nbs=1&deadline=1589874109&gen=playurl&os=ks3cbv&oi=1965551630&trid=ceac015d41e04a7b90ec972db710524fu&platform=pc&upsig=74d0d62697364346f88d9c39430ce23c&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&mid=293793435&logo=40000000"
                ]
            },
            {
                "order": 2,
                "length": 364395,
                "size": 23694756,
                "ahead": "",
                "vhead": "",
                "url": "http://upos-sz-mirrorcos.bilivideo.com/upgcxcode/98/24/872498/872498-2-15.flv?e=ig8euxZM2rNcNbRjhbUVhoM17bNBhwdEto8g5X10ugNcXBlqNxHxNEVE5XREto8KqJZHUa6m5J0SqE85tZvEuENvNo8g2ENvNo8i8o859r1qXg8xNEVE5XREto8GuFGv2U7SuxI72X6fTr859r1qXg8gNEVE5XREto8z5JZC2X2gkX5L5F1eTX1jkXlsTXHeux_f2o859IB_&uipk=5&nbs=1&deadline=1589874109&gen=playurl&os=cosbv&oi=1965551630&trid=ceac015d41e04a7b90ec972db710524fu&platform=pc&upsig=308c87c55f3325bdaac2a3e8632948ee&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&mid=293793435&logo=80000000",
                "backup_url": [
                    "http://upos-sz-mirrorks3c.bilivideo.com/upgcxcode/98/24/872498/872498-2-15.flv?e=ig8euxZM2rNcNbRjhbUVhoM17bNBhwdEto8g5X10ugNcXBlqNxHxNEVE5XREto8KqJZHUa6m5J0SqE85tZvEuENvNo8g2ENvNo8i8o859r1qXg8xNEVE5XREto8GuFGv2U7SuxI72X6fTr859r1qXg8gNEVE5XREto8z5JZC2X2gkX5L5F1eTX1jkXlsTXHeux_f2o859IB_&uipk=5&nbs=1&deadline=1589874109&gen=playurl&os=ks3cbv&oi=1965551630&trid=ceac015d41e04a7b90ec972db710524fu&platform=pc&upsig=eb8f043e0f36f82ab9c62fd002143438&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&mid=293793435&logo=40000000"
                ]
            },
            {
                "order": 3,
                "length": 352333,
                "size": 22835734,
                "ahead": "",
                "vhead": "",
                "url": "http://upos-sz-mirrorhw.bilivideo.com/upgcxcode/98/24/872498/872498-3-15.flv?e=ig8euxZM2rNcNbRjhwdVhoM17bdVhwdEto8g5X10ugNcXBlqNxHxNEVE5XREto8KqJZHUa6m5J0SqE85tZvEuENvNo8g2ENvNo8i8o859r1qXg8xNEVE5XREto8GuFGv2U7SuxI72X6fTr859r1qXg8gNEVE5XREto8z5JZC2X2gkX5L5F1eTX1jkXlsTXHeux_f2o859IB_&uipk=5&nbs=1&deadline=1589874109&gen=playurl&os=hwbv&oi=1965551630&trid=ceac015d41e04a7b90ec972db710524fu&platform=pc&upsig=2685b7649f4bb6eb90f986f125432d78&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&mid=293793435&logo=80000000",
                "backup_url": [
                    "http://upos-sz-mirrorks3c.bilivideo.com/upgcxcode/98/24/872498/872498-3-15.flv?e=ig8euxZM2rNcNbRjhwdVhoM17bdVhwdEto8g5X10ugNcXBlqNxHxNEVE5XREto8KqJZHUa6m5J0SqE85tZvEuENvNo8g2ENvNo8i8o859r1qXg8xNEVE5XREto8GuFGv2U7SuxI72X6fTr859r1qXg8gNEVE5XREto8z5JZC2X2gkX5L5F1eTX1jkXlsTXHeux_f2o859IB_&uipk=5&nbs=1&deadline=1589874109&gen=playurl&os=ks3cbv&oi=1965551630&trid=ceac015d41e04a7b90ec972db710524fu&platform=pc&upsig=922543bfb26184f901187bf9c39c69b2&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&mid=293793435&logo=40000000"
                ]
            },
            {
                "order": 4,
                "length": 356773,
                "size": 23466279,
                "ahead": "",
                "vhead": "",
                "url": "http://upos-sz-mirrorkodo.bilivideo.com/upgcxcode/98/24/872498/872498-4-15.flv?e=ig8euxZM2rNcNbRjhbUVhoM17bNBhwdEto8g5X10ugNcXBlqNxHxNEVE5XREto8KqJZHUa6m5J0SqE85tZvEuENvNo8g2ENvNo8i8o859r1qXg8xNEVE5XREto8GuFGv2U7SuxI72X6fTr859r1qXg8gNEVE5XREto8z5JZC2X2gkX5L5F1eTX1jkXlsTXHeux_f2o859IB_&uipk=5&nbs=1&deadline=1589874109&gen=playurl&os=kodobv&oi=1965551630&trid=ceac015d41e04a7b90ec972db710524fu&platform=pc&upsig=9d29707faf012797ef2b6de21523fcf2&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&mid=293793435&logo=80000000",
                "backup_url": [
                    "http://upos-sz-mirrorks3c.bilivideo.com/upgcxcode/98/24/872498/872498-4-15.flv?e=ig8euxZM2rNcNbRjhbUVhoM17bNBhwdEto8g5X10ugNcXBlqNxHxNEVE5XREto8KqJZHUa6m5J0SqE85tZvEuENvNo8g2ENvNo8i8o859r1qXg8xNEVE5XREto8GuFGv2U7SuxI72X6fTr859r1qXg8gNEVE5XREto8z5JZC2X2gkX5L5F1eTX1jkXlsTXHeux_f2o859IB_&uipk=5&nbs=1&deadline=1589874109&gen=playurl&os=ks3cbv&oi=1965551630&trid=ceac015d41e04a7b90ec972db710524fu&platform=pc&upsig=9ad4524d31c8d9695ae07b400b73ed29&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&mid=293793435&logo=40000000"
                ]
            }
        ]
    }
}
```

</details>

---

### DASH格式

`data`中的`dash`对象：

| 字段            | 类型  | 内容       | 备注         |
| --------------- | ----- | ---------- | ------------ |
| duration        | num   | 视频长度        | 秒值 |
| minBufferTime   | num   | 1.5？       |  |
| min_buffer_time | num   | 1.5？       |  |
| video           | array | 视频流信息 |              |
| audio           | array | 伴音流信息 | 当视频没有音轨时，此项为 null |
| dolby           | obj | 杜比全景声伴音信息 |              |
| flac           | obj | 无损音轨伴音信息 | 当视频没有无损音轨时，此项为 null |

`dash`中的`video`数组：

| 项   | 类型 | 内容                   | 备注 |
| ---- | ---- | ---------------------- | ---- |
| 0    | obj  | 视频码流 1 | 同一清晰度可拥有 H.264 / H.265 / AV1 多种码流<br />**HDR 仅支持 H.265** |
| n   | obj  | 视频码流（n+1） |   |
| ……   | obj  | ……    |      |

`dash`中的`audio`数组：

| 项   | 类型 | 内容          | 备注 |
| ---- | ---- | ------------- | ---- |
| 0    | obj  | 清晰度1       |      |
| n    | obj  | 清晰度（n+1） |      |
| ……   | obj  | ……            |      |

`video`及`audio`数组中的对象：

| 字段           | 类型  | 内容                  | 备注                                            |
| -------------- | ----- | --------------------- | ----------------------------------------------- |
| id             | num   | 音视频清晰度代码      | 参考上表<br />[qn视频清晰度标识](#qn视频清晰度标识)<br />[视频伴音音质代码](#视频伴音音质代码) |
| baseUrl        | str   | 默认流 URL | **注意 unicode 转义符**<br />有效时间为 120min |
| base_url       | str   | **同上**          |                                                 |
| backupUrl      | array | 备用流 URL |                                                 |
| backup_url     | array | **同上**              |                                                 |
| bandwidth      | num   | 所需最低带宽 | 单位为 Byte |
| mimeType       | str   | 格式 mimetype 类型 |                                                 |
| mime_type      | str   | **同上**              |                                                 |
| codecs         | str   | 编码/音频类型         | eg：`avc1.640032` |
| width          | num   | 视频宽度              | 单位为像素<br />**仅视频流存在该字段**        |
| height         | num   | 视频高度              | 单位为像素<br />**仅视频流存在该字段**         |
| frameRate      | str   | 视频帧率              | **仅视频流存在该字段**                         |
| frame_rate     | str   | **同上**              |                                                 |
| sar            | str   | Sample Aspect Ratio（单个像素的宽高比） | 音频流该值恒为空 |
| startWithSap   | num   | Stream Access Point（流媒体访问位点） | 音频流该值恒为空                     |
| start_with_sap | num   | **同上**              |  |
| SegmentBase    | obj   | 见下表                | url 对应 m4s 文件中，头部的位置<br />音频流该值恒为空     |
| segment_base   | obj   | **同上**              |  |
| codecid        | num   | 码流编码标识代码 | 含义见 [上表](#视频编码代码)<br />音频流该值恒为`0` |

`video`数组中的对象中的`backup_url`数组：

| 项   | 类型 | 内容             | 备注                                          |
| ---- | ---- | ---------------- | --------------------------------------------- |
| 0    | str  | 备用流 URL 1     | **注意 unicode 转义符**<br />有效时间为120min |
| n    | str  | 备用流 URL (n+1) |                                               |
| ……   | str  | ……               |                                               |

`video`数组中的对象中的`SegmentBase`对象：

| 字段           | 类型 | 内容                         | 备注                                                         |
| -------------- | ---- | ---------------------------- | ------------------------------------------------------------ |
| initialization | str  | `${init_first}-${init_last}` | eg：`0-821`<br />ftyp (file type) box 加上 moov box 在 m4s 文件中的范围（单位为 bytes）<br />如 0-821 表示开头 820 个字节 |
| index_range    | str  | `${sidx_first}-${sidx_last}` | eg：`822-1309`<br />sidx (segment index) box 在 m4s 文件中的范围（单位为 bytes）<br />sidx 的核心是一个数组，记录了各关键帧的时间戳及其在文件中的位置，<br />其作用是索引 (拖进度条) |

> 常规 MP4 文件的索引信息放在 moov box 中，其中包含每一帧 (不止是关键帧) 的一些信息。在 DASH 方式下，关键帧信息移到了 sidx box 里，其他的则分散到了各个 moof (movie fragment) box 中。

对这里的文件结构感兴趣的，可以参考标准文档 [ISO/IEC 14496-12](https://www.iso.org/standard/83102.html)，如果不想那么深入的话可以百度「[MP4 文件结构](https://baike.baidu.com/item/mp4/9218018)」

`dash`中的`dolby`对象：

此项为”杜比视界“视频独有

| 字段           | 类型 | 内容                                          | 备注                                                         |
| -------------- | ---- | --------------------------------------------- | ------------------------------------------------------------ |
| type | num  | 杜比音效类型 | 1：普通杜比音效<br />2：全景杜比音效 |
| audio    | array  | 杜比伴音流列表 |  |

`dolby`对象中的`audio`数组：

| 项   | 类型 | 内容                     | 备注                                            |
| ---- | ---- | ------------------------ | ----------------------------------------------- |
| 0    | obj  | 杜比伴音流信息 | 同上文 DASH 流中`video`及`audio`数组中的对象 |

`dash`中的`flac`对象：

| 项   | 类型 | 内容                     | 备注                                            |
| ---- | ---- | ------------------------ | ----------------------------------------------- |
| display    | bool  | 是否在播放器显示切换Hi-Res无损音轨按钮     |  |
| audio    | obj  | 音频流信息     | 同上文 DASH 流中`video`及`audio`数组中的对象 |

**示例：**

获取视频`av969628065`/`BV1rp4y1e745`中的 1P（cid=`244954665`）的视频流 URL，使用 DASH 方式获取

avid 方式：

```shell
curl -G 'https://api.bilibili.com/x/player/playurl' \
    --data-urlencode 'avid=969628065' \
    --data-urlencode 'cid=244954665' \
    --data-urlencode 'fnval=4048' \ # 4048 为所有 dash 选项或运算的结果
    --data-urlencode 'fnver=0' \
    --data-urlencode 'fourk=1' \
    -b 'SESSDATA=xxx'
```

 bvid 方式：

```shell
curl -G 'https://api.bilibili.com/x/player/playurl' \
    --data-urlencode 'bvid=BV1rp4y1e745' \
    --data-urlencode 'cid=244954665' \
    --data-urlencode 'fnval=4048' \
    --data-urlencode 'fnver=0' \
    --data-urlencode 'fourk=1' \
    -b 'SESSDATA=xxx'
```

<details>
<summary>查看响应示例：</summary>

```json
{
    "code": 0,
    "message": "0",
    "ttl": 1,
    "data": {
        "from": "local",
        "result": "suee",
        "message": "",
        "quality": 64,
        "format": "flv720",
        "timelength": 346495,
        "accept_format": "hdflv2,hdflv2,flv_p60,flv,flv720,flv480,mp4",
        "accept_description": [
            "真彩 HDR",
            "超清 4K",
            "高清 1080P60",
            "高清 1080P",
            "高清 720P",
            "清晰 480P",
            "流畅 360P"
        ],
        "accept_quality": [
            125,
            120,
            116,
            80,
            64,
            32,
            16
        ],
        "video_codecid": 7,
        "seek_param": "start",
        "seek_type": "offset",
        "dash": {
            "duration": 347,
            "minBufferTime": 1.5,
            "min_buffer_time": 1.5,
            "video": [
                {
                    "id": 80,
                    "baseUrl": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_f9-1-100113.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026og=hw\u0026oi=3028829496\u0026tag=\u0026nbs=1\u0026gen=playurlv3\u0026uipk=5\u0026os=mcdn\u0026platform=pc\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026deadline=1745411269\u0026upsig=71821c3a1f0d596b8a0f79861695de67\u0026uparams=e,og,oi,tag,nbs,gen,uipk,os,platform,trid,mid,deadline\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=773719\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026orderid=0,3",
                    "base_url": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_f9-1-100113.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026og=hw\u0026oi=3028829496\u0026tag=\u0026nbs=1\u0026gen=playurlv3\u0026uipk=5\u0026os=mcdn\u0026platform=pc\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026deadline=1745411269\u0026upsig=71821c3a1f0d596b8a0f79861695de67\u0026uparams=e,og,oi,tag,nbs,gen,uipk,os,platform,trid,mid,deadline\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=773719\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026orderid=0,3",
                    "backupUrl": [
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100113.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026mid=59442895\u0026uipk=5\u0026gen=playurlv3\u0026os=08cbv\u0026og=hw\u0026deadline=1745411269\u0026tag=\u0026nbs=1\u0026upsig=585675af7dc762a4d21572f939196248\u0026uparams=e,platform,trid,oi,mid,uipk,gen,os,og,deadline,tag,nbs\u0026bvc=vod\u0026nettype=0\u0026bw=773719\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026orderid=1,3",
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100113.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026oi=3028829496\u0026nbs=1\u0026uipk=5\u0026gen=playurlv3\u0026platform=pc\u0026mid=59442895\u0026deadline=1745411269\u0026tag=\u0026os=08cbv\u0026og=hw\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026upsig=9fc6a3e3e0eaf3847c5c0f1c32047c09\u0026uparams=e,oi,nbs,uipk,gen,platform,mid,deadline,tag,os,og,trid\u0026bvc=vod\u0026nettype=0\u0026bw=773719\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=2,3"
                    ],
                    "backup_url": [
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100113.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026mid=59442895\u0026uipk=5\u0026gen=playurlv3\u0026os=08cbv\u0026og=hw\u0026deadline=1745411269\u0026tag=\u0026nbs=1\u0026upsig=585675af7dc762a4d21572f939196248\u0026uparams=e,platform,trid,oi,mid,uipk,gen,os,og,deadline,tag,nbs\u0026bvc=vod\u0026nettype=0\u0026bw=773719\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026orderid=1,3",
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100113.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026oi=3028829496\u0026nbs=1\u0026uipk=5\u0026gen=playurlv3\u0026platform=pc\u0026mid=59442895\u0026deadline=1745411269\u0026tag=\u0026os=08cbv\u0026og=hw\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026upsig=9fc6a3e3e0eaf3847c5c0f1c32047c09\u0026uparams=e,oi,nbs,uipk,gen,platform,mid,deadline,tag,os,og,trid\u0026bvc=vod\u0026nettype=0\u0026bw=773719\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=2,3"
                    ],
                    "bandwidth": 772828,
                    "mimeType": "video/mp4",
                    "mime_type": "video/mp4",
                    "codecs": "hev1.1.6.L150.90",
                    "width": 1920,
                    "height": 960,
                    "frameRate": "30.303",
                    "frame_rate": "30.303",
                    "sar": "1:1",
                    "startWithSap": 1,
                    "start_with_sap": 1,
                    "SegmentBase": {
                        "Initialization": "0-1159",
                        "indexRange": "1160-2019"
                    },
                    "segment_base": {
                        "initialization": "0-1159",
                        "index_range": "1160-2019"
                    },
                    "codecid": 12
                },
                {
                    "id": 80,
                    "baseUrl": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_nb3-1-30080.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026platform=pc\u0026deadline=1745411269\u0026uipk=5\u0026og=cos\u0026gen=playurlv3\u0026os=mcdn\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026mid=59442895\u0026tag=\u0026nbs=1\u0026upsig=134e6b8516a05db7ef97a18b68b94cb5\u0026uparams=e,platform,deadline,uipk,og,gen,os,trid,oi,mid,tag,nbs\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=1918964\u0026buvid=\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026orderid=0,3",
                    "base_url": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_nb3-1-30080.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026platform=pc\u0026deadline=1745411269\u0026uipk=5\u0026og=cos\u0026gen=playurlv3\u0026os=mcdn\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026mid=59442895\u0026tag=\u0026nbs=1\u0026upsig=134e6b8516a05db7ef97a18b68b94cb5\u0026uparams=e,platform,deadline,uipk,og,gen,os,trid,oi,mid,tag,nbs\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=1918964\u0026buvid=\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026orderid=0,3",
                    "backupUrl": [
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30080.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026gen=playurlv3\u0026os=cosbv\u0026og=cos\u0026deadline=1745411269\u0026uipk=5\u0026nbs=1\u0026mid=59442895\u0026tag=\u0026upsig=d3f4bbcd7c490effdfdf0b9f8375f9a2\u0026uparams=e,platform,trid,oi,gen,os,og,deadline,uipk,nbs,mid,tag\u0026bvc=vod\u0026nettype=0\u0026bw=1918964\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026orderid=1,3",
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30080.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026platform=pc\u0026gen=playurlv3\u0026os=cosbv\u0026mid=59442895\u0026tag=\u0026nbs=1\u0026uipk=5\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026og=cos\u0026oi=3028829496\u0026deadline=1745411269\u0026upsig=584b3a331daefde16b118f612d43c1c6\u0026uparams=e,platform,gen,os,mid,tag,nbs,uipk,trid,og,oi,deadline\u0026bvc=vod\u0026nettype=0\u0026bw=1918964\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=2,3"
                    ],
                    "backup_url": [
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30080.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026gen=playurlv3\u0026os=cosbv\u0026og=cos\u0026deadline=1745411269\u0026uipk=5\u0026nbs=1\u0026mid=59442895\u0026tag=\u0026upsig=d3f4bbcd7c490effdfdf0b9f8375f9a2\u0026uparams=e,platform,trid,oi,gen,os,og,deadline,uipk,nbs,mid,tag\u0026bvc=vod\u0026nettype=0\u0026bw=1918964\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026orderid=1,3",
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30080.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026platform=pc\u0026gen=playurlv3\u0026os=cosbv\u0026mid=59442895\u0026tag=\u0026nbs=1\u0026uipk=5\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026og=cos\u0026oi=3028829496\u0026deadline=1745411269\u0026upsig=584b3a331daefde16b118f612d43c1c6\u0026uparams=e,platform,gen,os,mid,tag,nbs,uipk,trid,og,oi,deadline\u0026bvc=vod\u0026nettype=0\u0026bw=1918964\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=2,3"
                    ],
                    "bandwidth": 1916748,
                    "mimeType": "video/mp4",
                    "mime_type": "video/mp4",
                    "codecs": "avc1.640032",
                    "width": 1920,
                    "height": 960,
                    "frameRate": "29.412",
                    "frame_rate": "29.412",
                    "sar": "1:1",
                    "startWithSap": 1,
                    "start_with_sap": 1,
                    "SegmentBase": {
                        "Initialization": "0-994",
                        "indexRange": "995-1854"
                    },
                    "segment_base": {
                        "initialization": "0-994",
                        "index_range": "995-1854"
                    },
                    "codecid": 7
                },
                {
                    "id": 64,
                    "baseUrl": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_f9-1-100112.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026deadline=1745411269\u0026gen=playurlv3\u0026os=mcdn\u0026og=cos\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026mid=59442895\u0026tag=\u0026upsig=fcba1f000ead402f2ab2748df6e8d127\u0026uparams=e,deadline,gen,os,og,nbs,uipk,platform,trid,oi,mid,tag\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=1238263\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026orderid=0,3",
                    "base_url": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_f9-1-100112.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026deadline=1745411269\u0026gen=playurlv3\u0026os=mcdn\u0026og=cos\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026mid=59442895\u0026tag=\u0026upsig=fcba1f000ead402f2ab2748df6e8d127\u0026uparams=e,deadline,gen,os,og,nbs,uipk,platform,trid,oi,mid,tag\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=1238263\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026orderid=0,3",
                    "backupUrl": [
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100112.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026gen=playurlv3\u0026deadline=1745411269\u0026tag=\u0026og=cos\u0026oi=3028829496\u0026os=cosbv\u0026upsig=9ab39b34d214780c30147af36a862d89\u0026uparams=e,nbs,uipk,platform,trid,mid,gen,deadline,tag,og,oi,os\u0026bvc=vod\u0026nettype=0\u0026bw=1238263\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026orderid=1,3",
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100112.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026oi=3028829496\u0026nbs=1\u0026uipk=5\u0026tag=\u0026gen=playurlv3\u0026os=cosbv\u0026og=cos\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026deadline=1745411269\u0026upsig=bea70709fec064c8f384ee24eb5ccd1a\u0026uparams=e,oi,nbs,uipk,tag,gen,os,og,platform,trid,mid,deadline\u0026bvc=vod\u0026nettype=0\u0026bw=1238263\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=2,3"
                    ],
                    "backup_url": [
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100112.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026gen=playurlv3\u0026deadline=1745411269\u0026tag=\u0026og=cos\u0026oi=3028829496\u0026os=cosbv\u0026upsig=9ab39b34d214780c30147af36a862d89\u0026uparams=e,nbs,uipk,platform,trid,mid,gen,deadline,tag,og,oi,os\u0026bvc=vod\u0026nettype=0\u0026bw=1238263\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026orderid=1,3",
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100112.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026oi=3028829496\u0026nbs=1\u0026uipk=5\u0026tag=\u0026gen=playurlv3\u0026os=cosbv\u0026og=cos\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026deadline=1745411269\u0026upsig=bea70709fec064c8f384ee24eb5ccd1a\u0026uparams=e,oi,nbs,uipk,tag,gen,os,og,platform,trid,mid,deadline\u0026bvc=vod\u0026nettype=0\u0026bw=1238263\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=2,3"
                    ],
                    "bandwidth": 1236894,
                    "mimeType": "video/mp4",
                    "mime_type": "video/mp4",
                    "codecs": "hev1.1.6.L120.90",
                    "width": 1280,
                    "height": 640,
                    "frameRate": "58.824",
                    "frame_rate": "58.824",
                    "sar": "1:1",
                    "startWithSap": 1,
                    "start_with_sap": 1,
                    "SegmentBase": {
                        "Initialization": "0-1060",
                        "indexRange": "1061-1920"
                    },
                    "segment_base": {
                        "initialization": "0-1060",
                        "index_range": "1061-1920"
                    },
                    "codecid": 12
                },
                {
                    "id": 64,
                    "baseUrl": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_nb3-1-30074.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026oi=3028829496\u0026mid=59442895\u0026deadline=1745411269\u0026tag=\u0026gen=playurlv3\u0026platform=pc\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026nbs=1\u0026uipk=5\u0026os=mcdn\u0026og=hw\u0026upsig=0b3aae3388cb52b436e591615c048007\u0026uparams=e,oi,mid,deadline,tag,gen,platform,trid,nbs,uipk,os,og\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=1224265\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=0,3",
                    "base_url": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_nb3-1-30074.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026oi=3028829496\u0026mid=59442895\u0026deadline=1745411269\u0026tag=\u0026gen=playurlv3\u0026platform=pc\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026nbs=1\u0026uipk=5\u0026os=mcdn\u0026og=hw\u0026upsig=0b3aae3388cb52b436e591615c048007\u0026uparams=e,oi,mid,deadline,tag,gen,platform,trid,nbs,uipk,os,og\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=1224265\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=0,3",
                    "backupUrl": [
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30074.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026mid=59442895\u0026deadline=1745411269\u0026tag=\u0026nbs=1\u0026gen=playurlv3\u0026uipk=5\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026os=08cbv\u0026og=hw\u0026upsig=9dc7c021d5094eab92053fc58e84a48d\u0026uparams=e,mid,deadline,tag,nbs,gen,uipk,platform,trid,oi,os,og\u0026bvc=vod\u0026nettype=0\u0026bw=1224265\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=1,3",
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30074.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026deadline=1745411269\u0026tag=\u0026og=hw\u0026oi=3028829496\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026gen=playurlv3\u0026os=08cbv\u0026upsig=d2a75ae893a23a5d90630725d57efe72\u0026uparams=e,trid,mid,deadline,tag,og,oi,nbs,uipk,platform,gen,os\u0026bvc=vod\u0026nettype=0\u0026bw=1224265\u0026buvid=\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026orderid=2,3"
                    ],
                    "backup_url": [
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30074.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026mid=59442895\u0026deadline=1745411269\u0026tag=\u0026nbs=1\u0026gen=playurlv3\u0026uipk=5\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026os=08cbv\u0026og=hw\u0026upsig=9dc7c021d5094eab92053fc58e84a48d\u0026uparams=e,mid,deadline,tag,nbs,gen,uipk,platform,trid,oi,os,og\u0026bvc=vod\u0026nettype=0\u0026bw=1224265\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=1,3",
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30074.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026deadline=1745411269\u0026tag=\u0026og=hw\u0026oi=3028829496\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026gen=playurlv3\u0026os=08cbv\u0026upsig=d2a75ae893a23a5d90630725d57efe72\u0026uparams=e,trid,mid,deadline,tag,og,oi,nbs,uipk,platform,gen,os\u0026bvc=vod\u0026nettype=0\u0026bw=1224265\u0026buvid=\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026orderid=2,3"
                    ],
                    "bandwidth": 1222911,
                    "mimeType": "video/mp4",
                    "mime_type": "video/mp4",
                    "codecs": "avc1.640020",
                    "width": 1280,
                    "height": 640,
                    "frameRate": "62.500",
                    "frame_rate": "62.500",
                    "sar": "1:1",
                    "startWithSap": 1,
                    "start_with_sap": 1,
                    "SegmentBase": {
                        "Initialization": "0-994",
                        "indexRange": "995-1854"
                    },
                    "segment_base": {
                        "initialization": "0-994",
                        "index_range": "995-1854"
                    },
                    "codecid": 7
                },
                {
                    "id": 32,
                    "baseUrl": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_f9-1-100110.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026oi=3028829496\u0026uipk=5\u0026og=cos\u0026gen=playurlv3\u0026os=mcdn\u0026platform=pc\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026deadline=1745411269\u0026tag=\u0026nbs=1\u0026upsig=68bd74999864b4a96ac0dbb730b53612\u0026uparams=e,oi,uipk,og,gen,os,platform,trid,mid,deadline,tag,nbs\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=246761\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026orderid=0,3",
                    "base_url": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_f9-1-100110.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026oi=3028829496\u0026uipk=5\u0026og=cos\u0026gen=playurlv3\u0026os=mcdn\u0026platform=pc\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026deadline=1745411269\u0026tag=\u0026nbs=1\u0026upsig=68bd74999864b4a96ac0dbb730b53612\u0026uparams=e,oi,uipk,og,gen,os,platform,trid,mid,deadline,tag,nbs\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=246761\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026orderid=0,3",
                    "backupUrl": [
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100110.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026deadline=1745411269\u0026tag=\u0026gen=playurlv3\u0026uipk=5\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026os=cosbv\u0026og=cos\u0026oi=3028829496\u0026mid=59442895\u0026nbs=1\u0026upsig=25c03095d15e721ca7a7e80f9e831319\u0026uparams=e,deadline,tag,gen,uipk,platform,trid,os,og,oi,mid,nbs\u0026bvc=vod\u0026nettype=0\u0026bw=246761\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=1,3",
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100110.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026uipk=5\u0026os=cosbv\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026nbs=1\u0026platform=pc\u0026gen=playurlv3\u0026og=cos\u0026mid=59442895\u0026deadline=1745411269\u0026tag=\u0026upsig=c879e409a7bf7995c12ae5e22cb82b97\u0026uparams=e,uipk,os,trid,oi,nbs,platform,gen,og,mid,deadline,tag\u0026bvc=vod\u0026nettype=0\u0026bw=246761\u0026buvid=\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026orderid=2,3"
                    ],
                    "backup_url": [
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100110.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026deadline=1745411269\u0026tag=\u0026gen=playurlv3\u0026uipk=5\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026os=cosbv\u0026og=cos\u0026oi=3028829496\u0026mid=59442895\u0026nbs=1\u0026upsig=25c03095d15e721ca7a7e80f9e831319\u0026uparams=e,deadline,tag,gen,uipk,platform,trid,os,og,oi,mid,nbs\u0026bvc=vod\u0026nettype=0\u0026bw=246761\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=1,3",
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100110.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026uipk=5\u0026os=cosbv\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026nbs=1\u0026platform=pc\u0026gen=playurlv3\u0026og=cos\u0026mid=59442895\u0026deadline=1745411269\u0026tag=\u0026upsig=c879e409a7bf7995c12ae5e22cb82b97\u0026uparams=e,uipk,os,trid,oi,nbs,platform,gen,og,mid,deadline,tag\u0026bvc=vod\u0026nettype=0\u0026bw=246761\u0026buvid=\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026orderid=2,3"
                    ],
                    "bandwidth": 246476,
                    "mimeType": "video/mp4",
                    "mime_type": "video/mp4",
                    "codecs": "hev1.1.6.L120.90",
                    "width": 854,
                    "height": 426,
                    "frameRate": "30.303",
                    "frame_rate": "30.303",
                    "sar": "426:427",
                    "startWithSap": 1,
                    "start_with_sap": 1,
                    "SegmentBase": {
                        "Initialization": "0-1163",
                        "indexRange": "1164-2023"
                    },
                    "segment_base": {
                        "initialization": "0-1163",
                        "index_range": "1164-2023"
                    },
                    "codecid": 12
                },
                {
                    "id": 32,
                    "baseUrl": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_nb3-1-30032.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026deadline=1745411269\u0026nbs=1\u0026uipk=5\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026os=mcdn\u0026og=cos\u0026tag=\u0026platform=pc\u0026oi=3028829496\u0026gen=playurlv3\u0026upsig=99b3ff6929d865dafbbdf21301c3889b\u0026uparams=e,deadline,nbs,uipk,trid,mid,os,og,tag,platform,oi,gen\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=629530\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=0,3",
                    "base_url": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_nb3-1-30032.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026deadline=1745411269\u0026nbs=1\u0026uipk=5\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026os=mcdn\u0026og=cos\u0026tag=\u0026platform=pc\u0026oi=3028829496\u0026gen=playurlv3\u0026upsig=99b3ff6929d865dafbbdf21301c3889b\u0026uparams=e,deadline,nbs,uipk,trid,mid,os,og,tag,platform,oi,gen\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=629530\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=0,3",
                    "backupUrl": [
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30032.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026uipk=5\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026deadline=1745411269\u0026gen=playurlv3\u0026nbs=1\u0026platform=pc\u0026oi=3028829496\u0026mid=59442895\u0026tag=\u0026os=cosbv\u0026og=cos\u0026upsig=2e6bf8c0c1fc96618294d917f21192e7\u0026uparams=e,uipk,trid,deadline,gen,nbs,platform,oi,mid,tag,os,og\u0026bvc=vod\u0026nettype=0\u0026bw=629530\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026orderid=1,3",
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30032.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026platform=pc\u0026mid=59442895\u0026gen=playurlv3\u0026tag=\u0026nbs=1\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026os=cosbv\u0026og=cos\u0026deadline=1745411269\u0026uipk=5\u0026upsig=cc07c04afd6ac07b10f46241ef4c5fbc\u0026uparams=e,platform,mid,gen,tag,nbs,trid,oi,os,og,deadline,uipk\u0026bvc=vod\u0026nettype=0\u0026bw=629530\u0026buvid=\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026orderid=2,3"
                    ],
                    "backup_url": [
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30032.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026uipk=5\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026deadline=1745411269\u0026gen=playurlv3\u0026nbs=1\u0026platform=pc\u0026oi=3028829496\u0026mid=59442895\u0026tag=\u0026os=cosbv\u0026og=cos\u0026upsig=2e6bf8c0c1fc96618294d917f21192e7\u0026uparams=e,uipk,trid,deadline,gen,nbs,platform,oi,mid,tag,os,og\u0026bvc=vod\u0026nettype=0\u0026bw=629530\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026orderid=1,3",
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30032.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026platform=pc\u0026mid=59442895\u0026gen=playurlv3\u0026tag=\u0026nbs=1\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026os=cosbv\u0026og=cos\u0026deadline=1745411269\u0026uipk=5\u0026upsig=cc07c04afd6ac07b10f46241ef4c5fbc\u0026uparams=e,platform,mid,gen,tag,nbs,trid,oi,os,og,deadline,uipk\u0026bvc=vod\u0026nettype=0\u0026bw=629530\u0026buvid=\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026orderid=2,3"
                    ],
                    "bandwidth": 628803,
                    "mimeType": "video/mp4",
                    "mime_type": "video/mp4",
                    "codecs": "avc1.64001F",
                    "width": 854,
                    "height": 426,
                    "frameRate": "29.412",
                    "frame_rate": "29.412",
                    "sar": "426:427",
                    "startWithSap": 1,
                    "start_with_sap": 1,
                    "SegmentBase": {
                        "Initialization": "0-999",
                        "indexRange": "1000-1859"
                    },
                    "segment_base": {
                        "initialization": "0-999",
                        "index_range": "1000-1859"
                    },
                    "codecid": 7
                },
                {
                    "id": 16,
                    "baseUrl": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_f9-1-100109.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026og=hw\u0026oi=3028829496\u0026deadline=1745411269\u0026uipk=5\u0026platform=pc\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026gen=playurlv3\u0026os=mcdn\u0026tag=\u0026nbs=1\u0026upsig=cdb471486fa3908a2790ba9ef0fd0a44\u0026uparams=e,og,oi,deadline,uipk,platform,trid,mid,gen,os,tag,nbs\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=168083\u0026buvid=\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026orderid=0,3",
                    "base_url": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_f9-1-100109.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026og=hw\u0026oi=3028829496\u0026deadline=1745411269\u0026uipk=5\u0026platform=pc\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026gen=playurlv3\u0026os=mcdn\u0026tag=\u0026nbs=1\u0026upsig=cdb471486fa3908a2790ba9ef0fd0a44\u0026uparams=e,og,oi,deadline,uipk,platform,trid,mid,gen,os,tag,nbs\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=168083\u0026buvid=\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026orderid=0,3",
                    "backupUrl": [
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100109.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026tag=\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026deadline=1745411269\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026gen=playurlv3\u0026os=08cbv\u0026og=hw\u0026oi=3028829496\u0026upsig=340b5f721a89f6dd90ae6153225cf808\u0026uparams=e,tag,trid,mid,deadline,nbs,uipk,platform,gen,os,og,oi\u0026bvc=vod\u0026nettype=0\u0026bw=168083\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=1,3",
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100109.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026oi=3028829496\u0026mid=59442895\u0026tag=\u0026nbs=1\u0026uipk=5\u0026os=08cbv\u0026platform=pc\u0026deadline=1745411269\u0026gen=playurlv3\u0026og=hw\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026upsig=e6c5646fd0e0d9cbb16296d2c8d8649f\u0026uparams=e,oi,mid,tag,nbs,uipk,os,platform,deadline,gen,og,trid\u0026bvc=vod\u0026nettype=0\u0026bw=168083\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=2,3"
                    ],
                    "backup_url": [
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100109.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026tag=\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026deadline=1745411269\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026gen=playurlv3\u0026os=08cbv\u0026og=hw\u0026oi=3028829496\u0026upsig=340b5f721a89f6dd90ae6153225cf808\u0026uparams=e,tag,trid,mid,deadline,nbs,uipk,platform,gen,os,og,oi\u0026bvc=vod\u0026nettype=0\u0026bw=168083\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=1,3",
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-100109.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026oi=3028829496\u0026mid=59442895\u0026tag=\u0026nbs=1\u0026uipk=5\u0026os=08cbv\u0026platform=pc\u0026deadline=1745411269\u0026gen=playurlv3\u0026og=hw\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026upsig=e6c5646fd0e0d9cbb16296d2c8d8649f\u0026uparams=e,oi,mid,tag,nbs,uipk,os,platform,deadline,gen,og,trid\u0026bvc=vod\u0026nettype=0\u0026bw=168083\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=2,3"
                    ],
                    "bandwidth": 167889,
                    "mimeType": "video/mp4",
                    "mime_type": "video/mp4",
                    "codecs": "hev1.1.6.L120.90",
                    "width": 640,
                    "height": 320,
                    "frameRate": "30.303",
                    "frame_rate": "30.303",
                    "sar": "1:1",
                    "startWithSap": 1,
                    "start_with_sap": 1,
                    "SegmentBase": {
                        "Initialization": "0-1157",
                        "indexRange": "1158-2017"
                    },
                    "segment_base": {
                        "initialization": "0-1157",
                        "index_range": "1158-2017"
                    },
                    "codecid": 12
                },
                {
                    "id": 16,
                    "baseUrl": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_nb3-1-30016.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026oi=3028829496\u0026mid=59442895\u0026deadline=1745411269\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026gen=playurlv3\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026os=mcdn\u0026og=hw\u0026tag=\u0026upsig=93d8e429ac6dcf654df688457f138820\u0026uparams=e,oi,mid,deadline,nbs,uipk,platform,gen,trid,os,og,tag\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=353034\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026orderid=0,3",
                    "base_url": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_nb3-1-30016.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026oi=3028829496\u0026mid=59442895\u0026deadline=1745411269\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026gen=playurlv3\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026os=mcdn\u0026og=hw\u0026tag=\u0026upsig=93d8e429ac6dcf654df688457f138820\u0026uparams=e,oi,mid,deadline,nbs,uipk,platform,gen,trid,os,og,tag\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=353034\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026orderid=0,3",
                    "backupUrl": [
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30016.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026mid=59442895\u0026deadline=1745411269\u0026nbs=1\u0026gen=playurlv3\u0026os=08cbv\u0026og=hw\u0026uipk=5\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026tag=\u0026upsig=87f32943e6cfcb2957f0b90e9be210f3\u0026uparams=e,mid,deadline,nbs,gen,os,og,uipk,platform,trid,oi,tag\u0026bvc=vod\u0026nettype=0\u0026bw=353034\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026orderid=1,3",
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30016.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026uipk=5\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026mid=59442895\u0026og=hw\u0026tag=\u0026nbs=1\u0026deadline=1745411269\u0026gen=playurlv3\u0026os=08cbv\u0026upsig=0de6ac37eecd7261cc83e9e55f438747\u0026uparams=e,uipk,platform,trid,oi,mid,og,tag,nbs,deadline,gen,os\u0026bvc=vod\u0026nettype=0\u0026bw=353034\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=2,3"
                    ],
                    "backup_url": [
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30016.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026mid=59442895\u0026deadline=1745411269\u0026nbs=1\u0026gen=playurlv3\u0026os=08cbv\u0026og=hw\u0026uipk=5\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026tag=\u0026upsig=87f32943e6cfcb2957f0b90e9be210f3\u0026uparams=e,mid,deadline,nbs,gen,os,og,uipk,platform,trid,oi,tag\u0026bvc=vod\u0026nettype=0\u0026bw=353034\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026orderid=1,3",
                        "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30016.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026uipk=5\u0026platform=pc\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026mid=59442895\u0026og=hw\u0026tag=\u0026nbs=1\u0026deadline=1745411269\u0026gen=playurlv3\u0026os=08cbv\u0026upsig=0de6ac37eecd7261cc83e9e55f438747\u0026uparams=e,uipk,platform,trid,oi,mid,og,tag,nbs,deadline,gen,os\u0026bvc=vod\u0026nettype=0\u0026bw=353034\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=2,3"
                    ],
                    "bandwidth": 352627,
                    "mimeType": "video/mp4",
                    "mime_type": "video/mp4",
                    "codecs": "avc1.64001E",
                    "width": 640,
                    "height": 320,
                    "frameRate": "29.412",
                    "frame_rate": "29.412",
                    "sar": "1:1",
                    "startWithSap": 1,
                    "start_with_sap": 1,
                    "SegmentBase": {
                        "Initialization": "0-1002",
                        "indexRange": "1003-1862"
                    },
                    "segment_base": {
                        "initialization": "0-1002",
                        "index_range": "1003-1862"
                    },
                    "codecid": 7
                }
            ],
            "audio": [
                {
                    "id": 30232,
                    "baseUrl": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_nb3-1-30232.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026deadline=1745411269\u0026tag=\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026mid=59442895\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026gen=playurlv3\u0026os=mcdn\u0026og=cos\u0026upsig=c9f074f7fc113d3d06b928f74a1427d4\u0026uparams=e,deadline,tag,nbs,uipk,platform,mid,trid,oi,gen,os,og\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=76527\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=0,3",
                    "base_url": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_nb3-1-30232.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026deadline=1745411269\u0026tag=\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026mid=59442895\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026gen=playurlv3\u0026os=mcdn\u0026og=cos\u0026upsig=c9f074f7fc113d3d06b928f74a1427d4\u0026uparams=e,deadline,tag,nbs,uipk,platform,mid,trid,oi,gen,os,og\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=76527\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=0,3",
                    "backupUrl": [
                        "https://upos-sz-estgoss.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30232.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026deadline=1745411269\u0026uipk=5\u0026platform=pc\u0026gen=playurlv3\u0026og=cos\u0026oi=3028829496\u0026mid=59442895\u0026nbs=1\u0026os=upos\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026tag=\u0026upsig=d563b613434d1b8d4c2acc1717a82dfa\u0026uparams=e,deadline,uipk,platform,gen,og,oi,mid,nbs,os,trid,tag\u0026bvc=vod\u0026nettype=0\u0026bw=76527\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=1,3",
                        "https://upos-sz-estgoss.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30232.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026nbs=1\u0026uipk=5\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026mid=59442895\u0026deadline=1745411269\u0026gen=playurlv3\u0026tag=\u0026platform=pc\u0026os=upos\u0026og=cos\u0026upsig=0d401aeaea4a51b01605e5155ccf2e34\u0026uparams=e,nbs,uipk,trid,oi,mid,deadline,gen,tag,platform,os,og\u0026bvc=vod\u0026nettype=0\u0026bw=76527\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026orderid=2,3"
                    ],
                    "backup_url": [
                        "https://upos-sz-estgoss.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30232.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026deadline=1745411269\u0026uipk=5\u0026platform=pc\u0026gen=playurlv3\u0026og=cos\u0026oi=3028829496\u0026mid=59442895\u0026nbs=1\u0026os=upos\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026tag=\u0026upsig=d563b613434d1b8d4c2acc1717a82dfa\u0026uparams=e,deadline,uipk,platform,gen,og,oi,mid,nbs,os,trid,tag\u0026bvc=vod\u0026nettype=0\u0026bw=76527\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=1,3",
                        "https://upos-sz-estgoss.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30232.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026nbs=1\u0026uipk=5\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026mid=59442895\u0026deadline=1745411269\u0026gen=playurlv3\u0026tag=\u0026platform=pc\u0026os=upos\u0026og=cos\u0026upsig=0d401aeaea4a51b01605e5155ccf2e34\u0026uparams=e,nbs,uipk,trid,oi,mid,deadline,gen,tag,platform,os,og\u0026bvc=vod\u0026nettype=0\u0026bw=76527\u0026dl=0\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026orderid=2,3"
                    ],
                    "bandwidth": 76436,
                    "mimeType": "audio/mp4",
                    "mime_type": "audio/mp4",
                    "codecs": "mp4a.40.2",
                    "width": 0,
                    "height": 0,
                    "frameRate": "",
                    "frame_rate": "",
                    "sar": "",
                    "startWithSap": 0,
                    "start_with_sap": 0,
                    "SegmentBase": {
                        "Initialization": "0-933",
                        "indexRange": "934-1805"
                    },
                    "segment_base": {
                        "initialization": "0-933",
                        "index_range": "934-1805"
                    },
                    "codecid": 0
                },
                {
                    "id": 30280,
                    "baseUrl": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_nb3-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026mid=59442895\u0026gen=playurlv3\u0026tag=\u0026os=mcdn\u0026og=cos\u0026deadline=1745411269\u0026upsig=3d3484b4a91783d0d7277e073d947fad\u0026uparams=e,nbs,uipk,platform,trid,oi,mid,gen,tag,os,og,deadline\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=155073\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=0,3",
                    "base_url": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_nb3-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026mid=59442895\u0026gen=playurlv3\u0026tag=\u0026os=mcdn\u0026og=cos\u0026deadline=1745411269\u0026upsig=3d3484b4a91783d0d7277e073d947fad\u0026uparams=e,nbs,uipk,platform,trid,oi,mid,gen,tag,os,og,deadline\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=155073\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=0,3",
                    "backupUrl": [
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026og=cos\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026deadline=1745411269\u0026tag=\u0026gen=playurlv3\u0026os=cosbv\u0026platform=pc\u0026mid=59442895\u0026nbs=1\u0026uipk=5\u0026upsig=f7cc870e2a4925c24e46ad9425cf39a8\u0026uparams=e,og,trid,oi,deadline,tag,gen,os,platform,mid,nbs,uipk\u0026bvc=vod\u0026nettype=0\u0026bw=155073\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=1,3",
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026og=cos\u0026mid=59442895\u0026tag=\u0026nbs=1\u0026platform=pc\u0026gen=playurlv3\u0026os=cosbv\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026deadline=1745411269\u0026uipk=5\u0026upsig=d380844ae7ac21f8484650ba59a15d97\u0026uparams=e,og,mid,tag,nbs,platform,gen,os,trid,oi,deadline,uipk\u0026bvc=vod\u0026nettype=0\u0026bw=155073\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026orderid=2,3"
                    ],
                    "backup_url": [
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026og=cos\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026deadline=1745411269\u0026tag=\u0026gen=playurlv3\u0026os=cosbv\u0026platform=pc\u0026mid=59442895\u0026nbs=1\u0026uipk=5\u0026upsig=f7cc870e2a4925c24e46ad9425cf39a8\u0026uparams=e,og,trid,oi,deadline,tag,gen,os,platform,mid,nbs,uipk\u0026bvc=vod\u0026nettype=0\u0026bw=155073\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=1,3",
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026og=cos\u0026mid=59442895\u0026tag=\u0026nbs=1\u0026platform=pc\u0026gen=playurlv3\u0026os=cosbv\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026deadline=1745411269\u0026uipk=5\u0026upsig=d380844ae7ac21f8484650ba59a15d97\u0026uparams=e,og,mid,tag,nbs,platform,gen,os,trid,oi,deadline,uipk\u0026bvc=vod\u0026nettype=0\u0026bw=155073\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026f=u_0_0\u0026orderid=2,3"
                    ],
                    "bandwidth": 154889,
                    "mimeType": "audio/mp4",
                    "mime_type": "audio/mp4",
                    "codecs": "mp4a.40.2",
                    "width": 0,
                    "height": 0,
                    "frameRate": "",
                    "frame_rate": "",
                    "sar": "",
                    "startWithSap": 0,
                    "start_with_sap": 0,
                    "SegmentBase": {
                        "Initialization": "0-933",
                        "indexRange": "934-1805"
                    },
                    "segment_base": {
                        "initialization": "0-933",
                        "index_range": "934-1805"
                    },
                    "codecid": 0
                },
                {
                    "id": 30216,
                    "baseUrl": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_nb3-1-30216.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026platform=pc\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026os=mcdn\u0026deadline=1745411269\u0026tag=\u0026nbs=1\u0026uipk=5\u0026mid=59442895\u0026gen=playurlv3\u0026og=cos\u0026upsig=77babed89168a38118c16f99396e3fb6\u0026uparams=e,platform,trid,oi,os,deadline,tag,nbs,uipk,mid,gen,og\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=31750\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=0,3",
                    "base_url": "https://xy113x200x108x47xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_nb3-1-30216.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026platform=pc\u0026trid=0000cc6424a6fb564074a7704d5b300496eu\u0026oi=3028829496\u0026os=mcdn\u0026deadline=1745411269\u0026tag=\u0026nbs=1\u0026uipk=5\u0026mid=59442895\u0026gen=playurlv3\u0026og=cos\u0026upsig=77babed89168a38118c16f99396e3fb6\u0026uparams=e,platform,trid,oi,os,deadline,tag,nbs,uipk,mid,gen,og\u0026mcdnid=50017754\u0026bvc=vod\u0026nettype=0\u0026bw=31750\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=0,3",
                    "backupUrl": [
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30216.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026gen=playurlv3\u0026os=cosbv\u0026og=cos\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026tag=\u0026nbs=1\u0026oi=3028829496\u0026deadline=1745411269\u0026uipk=5\u0026platform=pc\u0026upsig=d76799fe0f76dea02c775c8667fc3f82\u0026uparams=e,gen,os,og,trid,mid,tag,nbs,oi,deadline,uipk,platform\u0026bvc=vod\u0026nettype=0\u0026bw=31750\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=1,3",
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30216.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026os=cosbv\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026oi=3028829496\u0026mid=59442895\u0026tag=\u0026gen=playurlv3\u0026og=cos\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026deadline=1745411269\u0026upsig=5cb2a5242aa474a5a0ba70e16b3d04f6\u0026uparams=e,os,nbs,uipk,platform,oi,mid,tag,gen,og,trid,deadline\u0026bvc=vod\u0026nettype=0\u0026bw=31750\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=2,3"
                    ],
                    "backup_url": [
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30216.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026gen=playurlv3\u0026os=cosbv\u0026og=cos\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026mid=59442895\u0026tag=\u0026nbs=1\u0026oi=3028829496\u0026deadline=1745411269\u0026uipk=5\u0026platform=pc\u0026upsig=d76799fe0f76dea02c775c8667fc3f82\u0026uparams=e,gen,os,og,trid,mid,tag,nbs,oi,deadline,uipk,platform\u0026bvc=vod\u0026nettype=0\u0026bw=31750\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=1,3",
                        "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/65/46/244954665/244954665_nb3-1-30216.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=\u0026os=cosbv\u0026nbs=1\u0026uipk=5\u0026platform=pc\u0026oi=3028829496\u0026mid=59442895\u0026tag=\u0026gen=playurlv3\u0026og=cos\u0026trid=cc6424a6fb564074a7704d5b300496eu\u0026deadline=1745411269\u0026upsig=5cb2a5242aa474a5a0ba70e16b3d04f6\u0026uparams=e,os,nbs,uipk,platform,oi,mid,tag,gen,og,trid,deadline\u0026bvc=vod\u0026nettype=0\u0026bw=31750\u0026f=u_0_0\u0026agrr=1\u0026buvid=\u0026build=0\u0026dl=0\u0026orderid=2,3"
                    ],
                    "bandwidth": 31705,
                    "mimeType": "audio/mp4",
                    "mime_type": "audio/mp4",
                    "codecs": "mp4a.40.5",
                    "width": 0,
                    "height": 0,
                    "frameRate": "",
                    "frame_rate": "",
                    "sar": "",
                    "startWithSap": 0,
                    "start_with_sap": 0,
                    "SegmentBase": {
                        "Initialization": "0-943",
                        "indexRange": "944-1815"
                    },
                    "segment_base": {
                        "initialization": "0-943",
                        "index_range": "944-1815"
                    },
                    "codecid": 0
                }
            ],
            "dolby": {
                "type": 0,
                "audio": null
            },
            "flac": null
        },
        "support_formats": [
            {
                "quality": 125,
                "format": "hdflv2",
                "new_description": "HDR 真彩",
                "display_desc": "HDR",
                "superscript": "",
                "codecs": [
                    "hev1.2.4.L156.90"
                ]
            },
            {
                "quality": 120,
                "format": "hdflv2",
                "new_description": "4K 超清",
                "display_desc": "4K",
                "superscript": "",
                "codecs": [
                    "avc1.640034",
                    "hev1.1.6.L156.90"
                ]
            },
            {
                "quality": 116,
                "format": "flv_p60",
                "new_description": "1080P 60帧",
                "display_desc": "1080P",
                "superscript": "60帧",
                "codecs": [
                    "avc1.640032",
                    "hev1.1.6.L150.90"
                ]
            },
            {
                "quality": 80,
                "format": "flv",
                "new_description": "1080P 高清",
                "display_desc": "1080P",
                "superscript": "",
                "codecs": [
                    "avc1.640032",
                    "hev1.1.6.L150.90"
                ]
            },
            {
                "quality": 64,
                "format": "flv720",
                "new_description": "720P 高清",
                "display_desc": "720P",
                "superscript": "",
                "codecs": [
                    "avc1.640020",
                    "hev1.1.6.L120.90"
                ]
            },
            {
                "quality": 32,
                "format": "flv480",
                "new_description": "480P 清晰",
                "display_desc": "480P",
                "superscript": "",
                "codecs": [
                    "avc1.64001F",
                    "hev1.1.6.L120.90"
                ]
            },
            {
                "quality": 16,
                "format": "mp4",
                "new_description": "360P 流畅",
                "display_desc": "360P",
                "superscript": "",
                "codecs": [
                    "avc1.64001E",
                    "hev1.1.6.L120.90"
                ]
            }
        ],
        "high_format": null,
        "last_play_time": 0,
        "last_play_cid": 0,
        "view_info": null,
        "play_conf": {
            "is_new_description": false
        }
    }
}
```

</details>

## 视频取流说明

关于拉流：

1. MP4 格式仅需拉视频流，DASH 格式需同时拉视频与伴音流
2. 如 DASH 格式需要杜比或无损的伴音，需要取对应`dolby`或`flac`字段中的流
3. **注意 Unicode 转义符**



关于鉴权：

1. WEB 端取流需要验证防盗链，即`referer`为 `.bilibili.com`域名下且 UA 不能为空
2. APP 端也需要验证防盗链，即 UA 需要含有`Mozilla/5.0 BiliDroid/*.*.* (bbcallen@gmail.com)`（*为版本）
3. 如`referer`或 UA 错误的情况会被判定为盗链，返回`403 Forbidden`故无法取流
4. 若传`platform=html5`参数取流，则不会进行防盗链验证，即可通过 HTML 标签`<video>`播放

**实例：**

下载 MP4 格式视频：

```shell
wget 'http://upos-sz-mirrorhw.bilivideo.com/upgcxcode/08/62/171776208/171776208-1-112.flv?e=ig8euxZM2rNcNbhMnwhVhwdlhzK3hzdVhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1589565412&gen=playurl&os=hwbv&oi=606631998&trid=e0fa5f9a7610440a871279a28fae85aau&platform=pc&upsig=5f469cb4c190ed54b89bd40cc37eddff&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&mid=293793435&logo=80000000' \
    -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    --referer 'https://www.bilibili.com' \
    -O 'Download_video.flv'
```

下载 DASH 格式视频：

```bash
# 下载视频流
wget 'https://cn-jxjj-ct-01-01.bilivideo.com/upgcxcode/65/46/244954665/244954665_f9-1-30125.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1674137769&gen=playurlv2&os=bcache&oi=606633952&trid=0000524e9cc80dea41dca72b59782270b5d3u&mid=293793435&platform=pc&upsig=c4206c80b1d0dc18c0545a7758d56eee&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,mid,platform&cdnid=4261&bvc=vod&nettype=0&orderid=0,3&buvid=EC1BD8EA-88F6-4951-BF27-2CFE3450C78F167646infoc&build=0&agrr=0&bw=1726751&logo=80000000' \
    -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    --referer 'https://www.bilibili.com' \
    -O 'video.m4s'
# 下载伴音流
wget 'https://xy125x75x230x185xy.mcdn.bilivideo.cn:4483/upgcxcode/65/46/244954665/244954665_f9-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1674137769&gen=playurlv2&os=mcdn&oi=606633952&trid=0000524e9cc80dea41dca72b59782270b5d3u&mid=293793435&platform=pc&upsig=e5feff4626de4c6fd2ed9c6061c324a0&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,mid,platform&mcdnid=1002708&bvc=vod&nettype=0&orderid=0,3&buvid=EC1BD8EA-88F6-4951-BF27-2CFE3450C78F167646infoc&build=0&agrr=0&bw=41220&logo=A0000001' \
    -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    --referer 'https://www.bilibili.com' \
    -O 'audio.m4s'
# 进行混流
ffmpeg -i video.m4s -i audio.m4s -c:v copy -c:a copy -f mp4 Download_video.mp4
```
