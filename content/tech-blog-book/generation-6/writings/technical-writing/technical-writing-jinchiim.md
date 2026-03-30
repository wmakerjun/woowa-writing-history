---
author: "jinchiim"
generation: 6
level: "technical-writing"
original_filename: "level4.md"
source: "https://github.com/woowacourse/woowa-writing/blob/ac5ce901e10cc36c4af1c5e007c71c0319bf156e/level4.md"
source_path: "level4.md"
---

# 오늘도 개발자가 에러 원인을 못찾겠다고 말했다.

### (문제 공유 및 효과적인 로그 찍기 실험 )

---

<br>


> ???: 00님 ~화면에서 ▵▵ 하는 문제가 있다는데 확인 가능하실까요?
> ???: 아~ 어디요? 어떤 기능이요? 아.. 잠시만요
> (잠시 후)
> ???:  제가 재연해보려고 하는데 아… 안되네요ㅜ 못찾겠어요… 더 기다려주시겠어요?

<br>

처음 서비스를 론칭 하면 이런 현상을 흔하게 겪게된다.  
때로는 코드를 작성한 개발자가 왜 문제를 빨리 못찾는지 답답하기도 하지만 결국 해결은 된다.

- 하지만 코드를 작성했던 동료가 나간다면?
- 그 상황에서 문제가 발생한다면 모든 코드를 분석할 수 있을까?
- 이런 현상은 왜 발생한 것이고, 우리에게 필요한 것은 무엇일까?

나는 그 답을 로그에서 찾았다.

## 로그란?

---

<br>   

처음 개발을 시작했을 때 누군가 나에게 이런 말을 했다.

> 로그를 찍으세요.

로그란 무엇일까?

보통 프로그램의 동작 데이터를 기록하는 것을 “Logging” 이라고 표현한다.   
이때 기록되는 데이터를 “일지"를 표현할 때 쓰는 단어를 써 `“Log”`라고 부른다.

다양한 로깅 프레임워크
오늘의 글의 도구인 `Spring Boot3`을 기준으로 했을 때 이런 로깅을 도와주기 위해 다양한 프레임워크가 있다.

Log4J  
LogBack  
Log4J2  
….

오늘은 `Spring Boot`의 기본 로깅 프레임워크인`LogBack`을 기준으로 글을 작성해보겠다.

## 로그는 왜 찍는가?

---

일단 알아보기 쉽게 에러를 만들어 `throw` 하는 로직을 작성했다고 가정해보자.

해당 코드는 유저의 정보를 불러오려고 시도했을때,
유저의 정보가 없는 경우 발생되는 에러다.

![img_1.png](https://raw.githubusercontent.com/woowacourse/woowa-writing/ac5ce901e10cc36c4af1c5e007c71c0319bf156e/img_1.png)

그리고 [Exceptions](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html)
라는 Spring 공식 문서를 참고해 이 에러를 처리해보겠다

![img.png](https://raw.githubusercontent.com/woowacourse/woowa-writing/ac5ce901e10cc36c4af1c5e007c71c0319bf156e/img.png)

이렇게 받은 `Exception`을 `toString()` 을 사용해 찍어주도록 하자.   
위의 모든 에러는 전부 커스텀 에러이기 때문에 문제가 생기더라도 원인을 찾을 수 있을 것이다.

## 문제 발생 케이스 1

---

만약 어떤 이유에서인지 로그인을 했는데도 인증되지 않는 유저로 인식되는 문제가 발생했다고 가정하자.

![img_4.png](https://raw.githubusercontent.com/woowacourse/woowa-writing/ac5ce901e10cc36c4af1c5e007c71c0319bf156e/img_4.png)

그렇다면 우리는 이런 로그를 확인하게 될 것 이다.
이 로그로 우리가 파악할 수 있는 것은 무엇일까?

- **인증이 되지 않은 유저가 인증이 필요한 요청을 했다.**

하나의 정보만으로 문제를 찾는다면   
결국 사막에서 바늘찾기 처럼 우리는 로그를 눈 앞에 두고 테스트를 작성하거나 문제 발생의 흐름을 파악하기 위해 많은 시간을 투자해야 한다.

이렇게 투자한 시간이 때로는 다른 업무들이 미뤄지게 되는 원인이 되며 팀원간의 불화로 이어지기도 한다.

그럼 이번에는 필요한 요소들을 추가해보자.
우선 문제가 발생한 위치를 알기가 어려우니 위치를 알 수 있는 방법을 찾아보자.

![img_6.png](https://raw.githubusercontent.com/woowacourse/woowa-writing/ac5ce901e10cc36c4af1c5e007c71c0319bf156e/img_6.png)

에러가 발생되며 호출되었던 메서드와 위치를 역 추적해 보여주는 `StackTrace`를 사용해보자.

![img_3.png](https://raw.githubusercontent.com/woowacourse/woowa-writing/ac5ce901e10cc36c4af1c5e007c71c0319bf156e/img_3.png)

이전과는 다르게 이렇게 `toString()`이 아닌 `getStackTrace()` 를 사용하도록 변경했다.
이제는 어떤 메서드에서 문제가 발생했는지 알 수 있게 된다.

<br>

## 문제 발생 케이스 2

---


![img_7.png](https://raw.githubusercontent.com/woowacourse/woowa-writing/ac5ce901e10cc36c4af1c5e007c71c0319bf156e/img_7.png)

이제는 로그로 두가지 정보를 얻을 수 있게 되었다.

- **인증이 되지 않은 유저가 인증이 필요한 요청을 했다.**
- **TokenCookieManager 메서드의 17번 줄에서 에러가 발생했다.**

이 두가지 정보로 우리는 쉽게 문제의 흐름을 알 수 있을까?   
아직은 어떤 API로부터 온 요청인지, 우리가 어떤 값을 받았는지 알 수 없다.

그리고

    1. 요청에서 해당 값을 전달받지 못했다.
    2. 중간에서 전달받은 메서드의 의해 값이 변경되었다.
    3. 요청 자체에서 값을 전달해주지 않는다.
    4. 존재해야 했을 값을 넣어주는 타 API 에서 문제가 발생되었다.
    5. 유저 데이터에 이상이 있다.
    ...

생각보다 메서드 내부의 코드를 잘못 작성했을 경우보다 다양한 경우가 더 잦게 존재할 수 있다.

이런 문제를 방지하기 위해서 우리는 코드만 리팩토링 하는 것이 아닌, 우리의 문제 대처 방식에 대해 리팩토링할 필요가 있다.

지금 이 글을 읽고 바로 실천해보자.

## 출처

---

[Spring - Exception](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html)   
[Spring - Stacktrace](https://docs.spring.io/spring-shell/reference/commands/builtin/stacktrace.html)   
[Spring - Logging](https://docs.spring.io/spring-boot/docs/2.1.8.RELEASE/reference/html/howto-logging.html)
