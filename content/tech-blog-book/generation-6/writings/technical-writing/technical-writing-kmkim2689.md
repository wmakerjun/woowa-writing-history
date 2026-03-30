---
author: "kmkim2689"
generation: 6
level: "technical-writing"
original_filename: "technical.md"
source: "https://github.com/woowacourse/woowa-writing/blob/fbb96c92f729842a324699520d5c7b3a36a92c1c/technical.md"
source_path: "technical.md"
---

# 코틀린 코루틴의 구조화된 동시성

## 구조화된 동시성이란

제한된 생명주기를 가진 `CoroutineScope` 내에서만 새로운 코루틴을 실행시킬 수 있다는 코루틴의 주요 특성을 이른다. 

이 특성을 활용하여 안드로이드 애플리케이션 이용 중 발생할 수 있는 `비정상적인 상황`들에 대처할 수 있다. 

### 필요성
GUI 프로그램에서 스레드를 블록하는 작업은 비동기적으로 수행하는 것이 사용자 경험에 매우 중요하다.
스레드를 블록하는 대표적인 작업들로 네트워크 통신, 데이터베이스 작업 등이 있다.

해당 작업들을 진행할 때, 일부 동작이 비정상적으로 이뤄진다 하더라도 나머지 작업들은 정상적으로 동작해야 할 것이다.
하지만 이를 방해하는 요소들이 상당수 존재한다. 
프로그램 구동 중 비동기 작업이 완료되지 않은 상태에서 화면을 벗어나거나, 여러 코루틴이 동작하고 있는 상태에서 하나의 코루틴이 비정상적으로 종료되는 등의 상황들이 있다.

사용자가 네트워크 요청을 하던 도중 화면을 벗어났다고 가정해보자. 
만약 해당 화면을 호스팅하는 객체가 메모리에서 해제되었음에도 불구하고 여전히 해당 화면에서 요청된 네트워킹 작업이 진행된다면 어떨까? 

더 이상 이뤄질 필요가 없는 작업을 지속하는 것은 CPU 및 메모리 자원의 낭비로 이어진다.
최악의 경우 메모리 누수가 발생하여 애플리케이션이 강제 종료 될 수 있다.

이러한 상황은 java 차원에서 제공하는 Thread를 부주의하게 활용하면 발생하는데, 코루틴을 사용하면 이러한 위험을 방지할 수 있다. 
코루틴은 `구조화된 동시성(Structured Concurrency)`이라는 특성을 가지기 때문이다.

## 구조화된 동시성의 원칙들

* 코루틴은 제한된 수명주기를 갖는다.
* 코루틴 Job끼리는 계층 구조를 가질 수 있다.
* 부모 Job은 자식 Job이 완료될 때까지 대기한다.
* 부모 Job이 취소되면 자식 Job도 취소된다.
* 자식 Job에 예외 발생 시, 부모 Job으로 예외가 전파될 수 있다.

이 특성들은 생명주기 관리, 취소 및 예외 처리 등의 측면에서 스레드 대신 코루틴을 사용할 때의 이점으로 작용한다.

## 1. 제한된 수명 주기를 갖는 코루틴

> 모든 코루틴은 특정 `CoroutineScope`에 종속되어, 제약된 수명 주기를 갖는다.

모든 `CoroutineScope`는 제한된 수명을 가진다.
따라서 `CoroutineScope`이 종료된다면, 해당 스코프 내에서 생성된 모든 코루틴들은 완료 여부에 관계 없이 모두 `취소`된다.
`
코루틴 생성 시, 반드시 `CoroutineScope` 내부에서 생성해야 컴파일이 이뤄진다.

`runBlocking`을 제외한 코루틴 빌더 함수들은 `CoroutineScope`의 확장함수라는 것이 그 증거이다.
이 빌더 함수들은 `CoroutineScope` 혹은 `suspend` 함수에서만 호출 가능한데, 이는 코루틴이 특정 생명주기 내에서 동작하도록 강제한다. 

```kotlin
val scope = CoroutineScope(Dispatchers.Default)

fun main() {
    // CoroutineScope 혹은 다른 suspend 함수 내부에서만 launch 혹은 async 호출 가능
    scope.launch {
        delay(100)
    }

    val deferredInt = scope.async {
        delay(1000)
        1
    }
}
```

이러한 특성으로 얻을 수 있는 이점은 생각보다 크다.

개발자는 스코프의 생명주기를 추적할 필요가 없으며, 해당 스코프의 코루틴들을 수동으로 취소시킬 필요가 없다.
적절한 시기에 코루틴들을 취소시켜 주기 때문에, 리소스의 낭비를 방지할 수 있으며 앱이 강제 종료될 위험도 적다.

## 2. 계층 구조를 가질 수 있는 코루틴 Job

일반적으로, 같은 CoroutineScope 안에서 생성한 코루틴들은 계층 구조를 갖는다.

어떤 `CoroutineScope` 안에서, 한 코루틴 안에 다른 코루틴을 만들면 두 코루틴의 Job은 부모-자식 관계를 맺는다.
이는 두 코루틴 자체가 계층 구조를 형성한다는 의미가 아니라, `CoroutineContext`의 요소 중 하나인 `Job`끼리 계층 구조를 갖게 된다는 것이다.

> **CoroutineContext란?** <br>
> 특정 CoroutineScope를 실행시키는 과정에서 사용되는 정보들의 집합이다.<br>모든 코루틴이 특정 CoroutineScope 내에서 실행되므로, 모든 코루틴은 특정 CoroutineContext 속에서 실행된다고도 볼 수 있다.<br>CoroutineContext를 구성하는 요소들로, Dispatcher, Job, Error Handler, Name이 있다.

```kotlin
val scope = CoroutineScope(Dispatchers.Default)

fun main() {
    scope.launch { // Root Job
        println("Root Job")

        // Child Job 1
        launch {
            println("Child Job 1")

            // Grandchild Job 1
            launch {
                println("Grandchild Job 1")
            }
            // Grandchild Job 2
            launch {
                println("Grandchild Job 2")
            }
        }

        // Child Job 2
        launch {
            println("Child Job 2")
            // Grandchild Job 3
            launch {
                println("Grandchild Job 3")
            }
        }
    }
}
```

구조화된 동시성이라는 특성에 따라, Job들이 같은 `CoroutineScope` 내에서 형성되었으므로 계층 구조를 형성한다.
```text
+--------------------------------+
|        CoroutineScope          |
|          (Root Job)            |
|           /      \             |
|      Child Job   Child Job     |
|        /    \         |        |
|   Grand-   Grand-   Grand-     |
|   child    child    child      |
|    Job      Job      Job       |
|                                |
+--------------------------------+
```

### Job 간 계층 구조 형성 과정
CoroutineScope는 기본적으로 Context를 가지는데, 그 element 중 하나인 Job은 기본적으로 형성된다.
(예외적으로, `GlobalScope`는 `EmptyCoroutineContext`를 가지며, 그에 따라 Job 역시 가지지 않는다.)
```
internal class ContextScope(context: CoroutineContext) : CoroutineScope {
    override val coroutineContext: CoroutineContext = context
    override fun toString(): String = "CoroutineScope(coroutineContext=$coroutineContext)"
}

@Suppress("FunctionName")
public fun CoroutineScope(context: CoroutineContext): CoroutineScope =
    ContextScope(if (context[Job] != null) context else context + Job())
```

특정 `CoroutineScope`에서 새로운 코루틴을 생성하면 그 코루틴은 `CoroutineScope`의 job과 부모-자식 관계를 형성한다. 
이 과정에서 별도의 설정이 없다면 자식 코루틴은 부모 코루틴으로부터 **Job을 제외한 모든 CoroutineContext 요소들**을 상속받는다. 자식 코루틴은 고유의 Job을 형성한다.

<img src="https://raw.githubusercontent.com/woowacourse/woowa-writing/fbb96c92f729842a324699520d5c7b3a36a92c1c/assets/context_elements.png" />
<img src="https://raw.githubusercontent.com/woowacourse/woowa-writing/fbb96c92f729842a324699520d5c7b3a36a92c1c/assets/child_elements.png" />

> Dispatcher Element는 그대로 상속받지만, Job은 새로 생성한다.

이렇게 생성된 자식 Job은 CoroutineScope의 Job을 부모 Job으로 간주한다.
이후 자식 코루틴에서 새로운 코루틴을 생성하면 마찬가지로 코루틴끼리 부모-자식 관계를 형성한다.

```kotlin
fun main() {
    val scopeJob = Job()
    val scope = CoroutineScope(Dispatchers.Default + scopeJob)
    
    var childCoroutineJob: Job? = null
    val coroutineJob = scope.launch {
        childCoroutineJob = launch {
            println("starting child coroutine")
            delay(1000)
        }
        println("coroutine started")
        delay(1000)
    }
    
    Thread.sleep(1000)
    
    // 모두 true
    println("is child coroutine job a child of coroutine job : ${coroutineJob.children.contains(childCoroutineJob)}")
    println("is coroutine job a child of scope job : ${scopeJob.children.contains(coroutineJob)}")
}
```

### Job 간 계층 구조 파괴
`CoroutineScope`뿐만 아니라, `launch`, `async` 등 빌더 함수도 `CoroutineContext` 매개변수를 갖는다.

이 과정에서 context에 **새로운 Job을 명시**하여 전달한다면, 해당 빌더 함수가 반환하는 Job 객체는 파라미터로 넘긴 Job 객체와 동일하지 않게 된다.
더 이상 상위 Job을 부모로 삼지 않게 되며, **부모 자식 관계가 깨진다.** 이후 해당 코루틴의 하위에 별도의 설정 없이 다른 코루틴을 만들면 다시 새로운 부모자식 관계가 시작된다.

그 여파로, **CoroutineScope가 취소될 때, 내부에 시작된 코루틴은 같이 취소되지 않는다.**
따라서, **코루틴 빌더 함수에 context로 Job을 전달하는 것은 대체로 권장되지 않는다.** 
구조화된 동시성의 이점을 잘 활용할 수 없기 때문이다.

```kotlin
fun main() {
    val scopeJob = Job()
    val scope = CoroutineScope(Dispatchers.Default + scopeJob)
    
    // 하위 코루틴의 CoroutineContext로 들어갈 새로운 Job
    val newJob = Job()
    val coroutineJob = scope.launch(newJob) {
        delay(1000)
    }
    
    // 모두 false
    println("newJob === coroutineJob? : ${newJob === coroutineJob}")		
    println("forms hierarchy? : ${scopeJob.children.contains(coroutineJob)}")
}
```

## 3. 부모 Job은 자식 Job들이 완료될 때까지 대기

자식 Job(들)이 모두 완료될 때까지, 부모 Job은 완료되지 않는다.

> 그림에서, GrandChildJob1 및 GrandChildJob2가 완료되어야 ChildJob1이 완료될 수 있다.<br>
> GrandChildJob3이 완료되어야 ChildJob2가 완료될 수 있으며,<br>
> 최종적으로 두 개의 ChildJob들이 모두 완료되어야 비로소 Root Job이 완료된다.

```text
+--------------------------------+
|        CoroutineScope          |
|          (Root Job)            |
|           /      \             |
|      ChildJob1   ChildJob2     |
|        /    \         |        |
|   Grand    Grand    Grand      |
|   child    child    child      |
|   Job1     Job2     Job3       |
|                                |
+--------------------------------+
```

아래 `parentJob`으로 선언한 코루틴 하위에는 자식 코루틴들이 정의되어 있다.
부모 Job과 자식 Job들이 완료되는 순서를 비교하기 위하여, parentJob이 끝날 때까지 대기하도록 하였다.

```kotlin
fun main() = runBlocking {
    val scope = CoroutineScope(Dispatchers.Default)
    // 부모 코루틴
    val parentJob = scope.launch {
        // 자식 코루틴
        launch {
            delay(1000)
            println("child coroutine 1 completed")
        }
        launch {
            delay(1000)
            println("child coroutine 2 completed")
        }
    }
    
    parentJob.join()
    println("parent completed")
}
```

코드 실행 시, 자식 코루틴들이 완료되고 나서야 부모 코루틴이 완료되었음을 확인할 수 있다.
> child coroutine 1 completed<br>
> child coroutine 2 completed<br>
> parent completed

## 4. 부모 Job 취소 시 자식 Job도 취소
부모 Job이 취소되면, 재귀적으로 자식 Job들도 취소된다.

반대로 **자식 Job이 취소**된다고 하더라도, **부모(Parent) Job 및 형제(Sibling) Job의 취소로 이어지지 않는다.**

```kotlin
fun main() = runBlocking {
    // CoroutineScope(부모 Job)
    val scope = CoroutineScope(Dispatchers.Default)
    
    // 자식 Job1
    scope.launch {
        delay(100)
        println("child coroutine1 completed")
    }.invokeOnCompletion { throwable ->
        if (throwable is CancellationException) {
            println("coroutine1 canceled")
        }
    }
    
    // 자식 Job2
    scope.launch {
        delay(100)
        println("child coroutine2 completed")
    }.invokeOnCompletion { throwable ->
        if (throwable is CancellationException) {
            println("coroutine2 canceled")
        }
    }
    
    // 부모 Job(즉, scope) 취소
    scope.cancel()
}
```

코드를 실행해 보면, 아무것도 출력되지 않는다.

cancel이 호출되고 children coroutine들이 취소될 때까지 프로그램이 기다리지 않기 때문이다.
자식 코루틴이 취소되고 invokeOnCompletion이 호출되기 이전에 프로그램이 종료된 것이다.

이를 해결하는 방법은 join을 호출하여 CoroutineScope의 Job이 완료되기까지 대기시키는 것이다.
- **`CoroutineScope.coroutineContext[Job]`으로 Job에 접근 가능하다.**
  (CoroutineContext의 element들은 Map으로 관리되는데, Job이라는 키를 활용해 Job 객체에 접근하기 위한 방식이다.)

```kotlin
fun main() = runBlocking {
    // 부모 job : scope job
    val scope = CoroutineScope(Dispatchers.Default)
    
    // 자식 job1
    scope.launch {
        delay(100)
        println("child coroutine1 completed")
    }.invokeOnCompletion { throwable ->
        if (throwable is CancellationException) {
            println("coroutine1 canceled")
        }
    }
    
    // 자식 job2
    scope.launch {
        delay(100)
        println("child coroutine2 completed")
    }.invokeOnCompletion { throwable ->
        if (throwable is CancellationException) {
            println("coroutine2 canceled")
        }
    }
    
    // cancel과 join을 동시에 진행
    scope.coroutineContext[Job]!!.cancelAndJoin()
}
```

> coroutine1 canceled<br>
> coroutine2 canceled

구조화된 동시성으로 인해, 직접적인 취소 명령이 없었음에도 자동으로 자식 Job들이 취소되었다.

## 5. 자식 Job의 예외 발생은 부모 Job으로 전파 가능

자식 코루틴에 예외가 발생한다면, 부모 코루틴의 Job이 어떤 것이냐에 따라 부모 코루틴으로 예외가 전파되고 형제 코루틴들이 취소될 수 있다.

> 주의 1 : 예외들 중, CancellationException은 예외이다. 자식 코루틴이 CancellationException으로 취소되면 부모 코루틴이 일반 Job이라고 해도 형제 코루틴의 취소로 이어지지는 않는다.

> 주의 2 : CoroutineScope에서 ExceptionHandler를 적용한다고 하더라도 이 원칙은 깨지지 않는다. Exception Handler를 활용해도, 자식 코루틴 예외 발생 시 부모 코루틴이 context로 일반 Job을 가진다면 형제 코루틴이 취소된다.

- Exception Handling 관련 특성
코루틴이 가지고 있는 CoroutineContext 중, Job으로 보유할 수 있는 것은 일반적인 `Job`과 `SupervisorJob` 중 하나이다.

만약 실패한 자식 Job의 `부모 Job`이
- `Job`이라면, 해당 부모 Job의 다른 모든 자식 Job(실패한 자식 Job의 형제 Job들)이 취소되고(결국 부모 Job의 모든 자손 Job들이 취소), 예외는 부모가 SupervisorJob일 때까지 재귀적으로 전파된다. 해당 예외 전파 특성은 예외의 유실을 막아준다.

- `SupervisorJob`이라면, 형제 Job들이 취소되지도 않고, 실패한 Job의 예외가 부모로 전파되지도 않는다.

```kotlin
fun main() = runBlocking {
    // 부모 Job(coroutine scope의 job)으로의 예외 전파 여부 확인
    val exceptionHandler = CoroutineExceptionHandler { coroutineContext, throwable ->
        println("caught exception $throwable")
    }
    // 일반적인 Job을 활용하는 CoroutineScope
    val scope = CoroutineScope(Job() + exceptionHandler)

    scope.launch {
        println("coroutine 1 start")
        delay(50)
        println("coroutine 1 fails")
        throw RuntimeException()
    }

    scope.launch {
        println("coroutine 2 start")
        delay(500)
        println("coroutine 2 completed")
    }.invokeOnCompletion { throwable ->
        if (throwable is CancellationException) {
            println("coroutine 2 also canceled!")
        }
    }

    scope.coroutineContext[Job]!!.join()
}
```

> coroutine 1 start<br>
> coroutine 2 start<br>
> coroutine 1 fails<br>
> coroutine 2 also canceled!<br>
> caught exception java.lang.RuntimeException

형제 코루틴이 취소되었고, 부모로도 예외가 전파되어 부모 Job도 취소되었다.
이는 부모 Job으로 일반적인 Job이 활용되었기 때문이다.

### SupervisorJob

만약 어떤 코루틴의 예외 발생이 부모 및 형제로 전파되는 것을 원하지 않는다면, 해당 코루틴에 `SupervisorJob`을 활용하면 된다.

```kotlin
fun main() = runBlocking<Unit> {
    // 부모 Job(coroutine scope의 job)으로의 예외 전파 여부 확인
    val exceptionHandler = CoroutineExceptionHandler { coroutineContext, throwable ->
        println("caught exception $throwable")
    }
    // **SupervisorJob**을 활용하는 CoroutineScope
    val scope = CoroutineScope(**SupervisorJob()** + exceptionHandler)

    scope.launch {
        println("coroutine 1 start")
        delay(50)
        println("coroutine 1 fails")
        throw RuntimeException()
    }

    scope.launch {
        println("coroutine 2 start")
        delay(500)
        println("coroutine 2 completed")
    }.invokeOnCompletion { throwable ->
        if (throwable is CancellationException) {
            println("coroutine 2 also canceled!")
        }
    }

    Thread.sleep(1000)
    // result : false
    println("is coroutine scope job active? : ${scope.coroutineContext[Job]!!.isActive}")
}
```

> coroutine 1 start
> coroutine 2 start
> coroutine 1 fails
> caught exception java.lang.RuntimeException // Scope에서 예외는 잡음. 부모로 전파되지 않을 뿐
> coroutine 2 completed!
> is coroutine scope job active? : false

부모가 취소되지 않고, 형제도 취소되지 않았다.

안드로이드 프로그래밍에서 이러한 특성을 활용해야 하는 경우가 있다.

여러 UI 혹은 비즈니스 로직이 동시에 동작하는 동안, 한 동작에 예외가 발생한다고 해서 다른 동작들이 취소된다면, 사용자 경험에 부정적인 영향을 줄 수 있다.
따라서, 안드로이드 프레임워크 상에서 제공하는 `viewModelScope` 및 `lifecycleScope`에서는 `SupervisorJob`을 기반으로 `CoroutineScope`가 구현되어 있다.

이것을 활용하면 각 작업들을 독립적으로 관리할 수 있으며, 한 코루틴의 예외가 다른 코루틴으로 전파되지 않도록 할 수 있다.
특히 특정 기능에서 오류가 발생해도 전체 앱이 중단되지 않도록 하며 다른 기능들은 정상적으로 동작시킬 수 있다.

```
class MyViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {
            try {
                // 데이터 로딩 로직
            } catch (e: Exception) {
                // 이 예외는 다른 코루틴에 영향을 주지 않음
                Log.e("MyViewModel", "Data loading failed", e)
            }
        }
    }

    fun updateUI() {
        viewModelScope.launch {
            // UI 업데이트 로직
            // loadData()에서 예외가 발생해도 이 코루틴은 계속 실행됨
        }
    }
}
```

이러한 방식으로 `SupervisorJob`을 활용하면, 안드로이드 앱의 각 기능을 독립적으로 동작시킴으로써 전체적인 안정성과 사용자 경험을 향상시킬 수 있다. 
특히 복잡한 화면이나 여러 비동기 작업이 동시에 실행되는 상황에서 이것을 유용하게 사용할 수 있다.
