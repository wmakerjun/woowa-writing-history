---
author: "hwinkr"
generation: 6
level: "technical-writing"
original_filename: "technical-writing.md"
source: "https://github.com/woowacourse/woowa-writing/blob/82adbab10be2ab6f290c187580044e5be0eb2e37/technical-writing.md"
source_path: "technical-writing.md"
---

# 프론트엔드에서 상태란?

현대 프론트엔드를 개발하다 보면, “**상태”, “상태 관리”** 라는 용어를 정말 자주 접하게 됩니다.

과연 상태라는 것은 무엇일까요? 왜 상태와 상태 관리에 대해서 잘 아는것이 중요할까요? 리액트를 중심으로 상태와 상태를 관리하는 방법에 대해서 알아보기 전 우선, 프론트엔드 영역에서 상태라는 것이 어떤 것을 의미하는지 부터 알아보겠습니다.

## 1. 프론트엔드 영역에서 상태란?

프론트엔드 영역에서 상태란, 웹 애플리케이션을 구성하는 **데이터**입니다. 그러나, 무조건 데이터라고 해서 상태가 될 수 있는 것은 아닙니다. 상태인 것과 그렇지 않은 것을 구분하는 가장 큰 기준은 변할 수 있는 데이터여야 한다는 것입니다. 상태는 **변할 수 있는 데이터**입니다.

어떤 것들이 상태가 될 수 있는지에 따라서 예시를 통해 조금 더 알아봅시다.

### 폼 입력값

아래와 같은 입력 필드에 값을 입력하는 상황을 생각해 봅시다.

![technical-writing-1](https://github.com/user-attachments/assets/84be72b2-c2f6-45b1-bc50-5d0c7d7796f6)

키보드를 통해 값을 입력하고 입력된 값이 사용자의 눈에 보이게 됩니다. 값을 입력하거나 지울 때마다 **입력값 데이터가 변하며** 사용자는 변하는 데이터를 확인하게 됩니다.

![writing-2](https://github.com/user-attachments/assets/049d8dc2-3f7a-4eb6-a658-4ac97d08b43b)

값을 입력할 때마다, 입력값 데이터가 변경되며 입력 필드에 입력한 값이 UI로 표현됩니다. 로그인 여부를 판단하고 사용자에게 알려주는 예시를 통해서 조금 더 자세하게 알아보겠습니다.

### 로그인 여부

특정 서비스에 사용자의 로그인 여부 상태에 따라서 UI를 다르게 표현해야 합니다.

<img src="https://github.com/user-attachments/assets/f99b054c-0220-468c-8299-c4ba78e6a31e" height="400px"/>

사용자가 아이디, 비밀번호를 입력하고 서비스에 로그인하면 **로그인 여부 데이터가 변하며**, UI가 다르게 표현됩니다.

위 두 가지 예시를 제외하고도

- 모달 UI의 열고/닫힘 여부
- 다크 모드/라이트 모드
- 사용자가 문서를 읽고 있는 언어 설정

등등 정말 많은 데이터가 상태로 존재할 수 있습니다. 상태는 변할 수 있는 데이터이며, 상태의 변화는 곧 상태로 표현할 수 있는 UI의 변화로 이어집니다.

## 2. 상태를 잘 알아야 하는 이유, 상태 관리의 중요성

위 예시들에서도 확인할 수 있듯, 상태는 변할 수 있고 상태의 변화는 UI의 변화로 이어집니다. 그렇다면 어떤 상황에서 상태가 변경될 수 있을까요? 시간에 따라서도 상태는 변할 수 있겠지만 대부분의 경우 사용자가 서비스 내에서 **특정 행동**을 할 때 상태가 변경됩니다.

입력 폼에서는 키보드를 입력하는 행동으로, 로그인 여부에 따라 버튼 UI가 달라지는 것은 로그인을 하는 행동으로, 모달 UI의 열고/닫힘 여부는 모달을 열고 닫을 수 있는 버튼을 클릭하는 행동으로 인해서 상태가 변경됩니다. 상태가 변경되었다는 것을 UI에 바로 표현해 주는 것은 사용자 경험에 있어서 굉장히 중요한 요소입니다. 위 예시에서는 하나의 데이터 당 하나의 UI만 표현하고 있지만, 하나의 데이터에 대해서 여러 UI를 표현할 수도 있습니다.

<img src="https://github.com/user-attachments/assets/a186cff3-9307-4c77-a947-4522ecdc6e91" height="400px"/>

상태를 잘 관리하는 것은 매우 중요합니다. 하나의 데이터에 대해 여러 UI를 표현할 때, 상태를 잘못 관리하면 일관되지 않은 UI가 발생하여 사용자에게 혼란을 줄 수 있습니다. 예를 들어, 데이터는 1234인데 UI는 12만 표현된다면 사용자는 혼란을 느낄 것입니다. 이런 상태 관리의 오류는 사용자 경험을 저하시킬 뿐만 아니라, 서비스의 규모가 커지고 상태의 복잡도가 증가할 때 코드의 복잡도를 높이고 유지보수를 어렵게 만들 수 있습니다. 따라서, 효율적인 상태 관리는 코드의 품질을 유지하고 협업에서 일관성을 확보하는 데 매우 중요합니다.

## 정리

현대 프론트엔드 개발에서 상태는 빼놓을 수 없는 핵심 개념입니다. 입력, 로그인 예시를 통해서 상태가 무엇인지 살펴봤습니다. 상태와 상태 관리에 대해서 잘 알면 사용자의 경험을 개선해 줄 수 있으며, 코드의 가독성 또한 높일 수 있습니다. 핵심은 **안정적인 서비스**를 만드는 것입니다.

# 리액트에서 상태란?

프론트엔드에서 상태에 대해서 이해해 봤으니, 리액트는 어떻게 상태를 바라보고 관리하는지 알아보겠습니다. 우선, 리액트는 어떤 도구인지 어떤 [멘탈모델](https://en.wikipedia.org/wiki/Mental_model)을 가지고 있는지 부터 간단하게 알아보겠습니다.

## 리액트?

리액트는 UI를 쉽고 편하게 선언적으로 만들어갈 수 있도록 여러 기능을 제공해 주는 자바스크립트 라이브러리입니다. 리액트는 컴포넌트를 기반으로 선언적으로 UI를 만들어 갑니다. 선언적으로 UI를 만들면 **어떻게(HOW) 보여줄지 과정을 설명하는 것이 아니라, 어떤 것(WHAT)을 보여줄지 선언하기만 하면 됩니다.**

```jsx
async function handleFormSubmit(e) {
  e.preventDefault();
  disable(textarea);
  disable(button);
  show(loadingMessage);
  hide(errorMessage);
  try {
    await submitForm(textarea.value);
    show(successMessage);
    hide(form);
  } catch (err) {
    show(errorMessage);
    errorMessage.textContent = err.message;
  } finally {
    hide(loadingMessage);
    enable(textarea);
    enable(button);
  }
}
```

폼 제출 이벤트를 핸들링하는 함수가 위와 같이 구현되어 있다고 해봅시다. 폼을 제출하면 textarea, button을 비활성화 하고 → loadingMessage를 보여주고 → errorMessage를 숨기고… > 네트워크 응답에 따라서 다른 UI를 표현하기 위해서 위에서 부터 아래로 함수를 호출하며 **UI의 흐름을 절차적으로 설명**합니다. 현재는 하나의 폼 제출에 대해서만 예시를 들었지만, 더욱 복잡하고 많은 상호작용을 처리하기 위한 핸들러 함수를 절차적으로 정의하다보면 어떤 것을 보여줘야 할지, 지워야 할지에 대한 것을 잊기 쉽습니다.

리액트는 절차적으로 UI를 만들어가는 것 대신, **컴포넌트가 가질 수 있는 시각적 상태**를 파악하고 각각의 시각적 상태들로 어떤(WHAT) UI를 만들 것인지 선언합니다.

```jsx
const 폼의시각적상태 = 'empty' | 'typing' | 'submitting' | 'success' | 'error'

<Form status={폼의시각적상태} />
```

위 코드에서는 폼 UI가 가질 수 있는 시각적 상태를 정의합니다. 그리고 Form 컴포넌트에 상태를 전달해 주고 상태에 따라서 다른 UI를 그릴 것을 **선언합니다.** 컴포넌트란, 전체 UI 영역을 구성하는 독립적이고 재사용 가능한 조각들을 말합니다. 즉, 컴포넌트는 화면의 **특정 부분을 담당**하고 버튼, 입력 폼, 테이블 등 다양한 형태로 존재할 수 있습니다. 해당 내용은 [리액트 공식문서 - State를 통해 Input 다루기](https://ko.react.dev/learn/reacting-to-input-with-state#how-declarative-ui-compares-to-imperative)에서 참고한 내용이니 더 자세하게 해당 내용을 학습하시고 싶다면 방문해 보세요.

## 리액트에서 상태란?

위 내용에서도 확인할 수 있듯, 리액트에서 상태란 **컴포넌트의 시각적 결과물**에 영향을 미치는 **동적인 데이터**를 말합니다. 리액트에서 컴포넌트는 상태에 따라서 다양한 UI를 그릴 수 있고, 이 과정을 **컴포넌트를 렌더링**한다고 표현합니다.

## 렌더링?

렌더링에 대해서 조금 더 자세하게 알아보자면, 리액트에서 렌더링이란 **현재 props 및 상태를 기반**으로 컴포넌트에게 **UI 영역이 어떻게 보이길 원하는지 설명을 요청하는 하나의 프로세스**입니다. 사용자의 행동, 시간의 변화로 인해서 **상태가 변경되면 리액트는 컴포넌트를 다시 렌더링** 합니다. 즉, 다시 어떤 UI를 그려야 하는지에 대한 설명을 요청합니다.

```jsx
function Component(props) => {
	const state = ...
	return UI
}
```

리액트의 함수형 컴포넌트를 기준으로 렌더링을 간단하게 생각해 보면, 현재 prop와 state로 함수를 다시 호출한다고 생각해 볼 수 있습니다.

리액트 앱은 **DOM 트리 구조처럼, 컴포넌트 트리 구조를 가지며** 컴포넌트들 사이에 부모, 자식, 형제 관계를 가집니다. 리액트에서 상태가 변경되면, 가장 최상위에 있는 트리의 노드부터 시작해 UI를 다시 그려야 하는 즉, 다시 렌더링해야 하는 모든 컴포넌트를 순회하며 찾습니다.

<img src="https://github.com/user-attachments/assets/fd949aec-a616-42ee-9c14-edd6c2255800" height="400px"/>

위 이미지에서도 확인할 수 있듯, 리액트에서 컴포넌트 구조는 트리 형태로 나타낼 수 있습니다. 사용자가 특정 컴포넌트 내부에서 상태를 변경하는 행동을 했다면, 해당 컴포넌트를 변경이 필요하다는 컴포넌트로 표시한 후 다시 렌더링합니다. 렌더링은 최상위 컴포넌트(위 예시에서는 App.tsx)부터 시작하며 빨간색으로 변경이 필요하다고 표시된 컴포넌트만 다시 렌더링합니다.

리액트에서는 일반적으로 부모 컴포넌트가 렌더링되면, 모든 하위 자식 컴포넌트들도 재귀적으로 렌더링합니다. 부모 컴포넌트의 렌더링 결과에는 자식 컴포넌트들이 중첩되어 포함되어 있습니다. **자식 컴포넌트들도 변경 사항이 있는지 확인하기 위해서** 재귀적으로 모든 하위 컴포넌트를 렌더링합니다. [리액트 공식문서 - 렌더링 그리고 커밋 2단계: React 컴포넌트 렌더링](https://ko.react.dev/learn/render-and-commit#step-2-react-renders-your-components)을 통해 더 자세한 내용을 학습해 보세요.

## 리액트 상태에 대한 추가적인 개념

추가로 리액트 공식문서에서는 상태를 [컴포넌트의 기억 저장소](https://ko.react.dev/learn/state-a-components-memory), [UI의 스냅샷](https://ko.react.dev/learn/state-as-a-snapshot)이라고 표현하기도 합니다. 기억 저장소라는 것은 컴포넌트가 다시 렌더링 되어도, 이전 상태를 기억하고 있다는 것을 말합니다. 컴포넌트가 기억하고 있는 이전 상태를 기반으로 새로운 상태를 만듭니다. 이에 대해서는 아래에서 더 자세히 살펴보겠습니다.

UI의 스냅샷이라는 것은 컴포넌트를 렌더링하는 시점의 props와 상태를 기반으로 UI를 생성한다는 것을 의미합니다. 이는 마치, 사진을 찍어서 컴포넌트의 순간적인 모습을 담아내는 것과 같기 때문에 스냅샷이라는 표현을 사용합니다.

## 정리

리액트에서의 상태, 컴포넌트, 렌더링에 대해서 알아본 내용을 다시 한 번 정리해 봅시다.

- **리액트는 UI를 쉽고, 선언적으로 만들 수 있는 자바스크립트 라이브러리입니다**
- **컴포넌트를 기반으로 UI를 구축**하며, 어떻게(HOW)보다, 무엇(WHAT)을 보여줄지 선언합니다.
- **리액트에서의 상태란, 컴포넌트의 렌더링 결과물**에 영향을 미치는 **동적인 데이터**입니다.
- 상태가 변할 때마다, **UI를 다시 그려줄 것을 요청**하며 이 과정을 렌더링이라고 합니다.
- 리액트에서 컴포넌트는 DOM 트리 구조처럼, 컴포넌트 트리 구조를 가집니다.
- 상태가 변경되었을 때, 최상위 노드부터 **변경이 필요한 컴포넌트를 찾아 렌더링**합니다.
- 부모 컴포넌트가 렌더링되면 **일반적으로 모든 하위 자식 컴포넌트들도 재귀적으로 렌더링**됩니다.

# 리액트에서 지역 상태를 관리하는 방법

리액트에서 상태가 무엇인지와 추가적으로 컴포넌트와 렌더링에 대해서도 알아봤습니다. 이제 리액트에서 지역 상태를 관리하는 방법에 대해서 알아보겠습니다. 리액트에서 상태를 변경하는 방법은 `useState`, `useReducer`와 같은 훅을 사용하는 것입니다. 해당 훅을 사용하지 않고도 상태를 변경할 수 있지 않을까요? 아래 예시를 살펴봅시다.

```jsx
const Component = () => {
  let nickName = "harry";

  const onButtonClick = () => {
    nickName = "hyunwoong";
  };

  return (
    <div>
      <h2>{nickName}</h2>
      <button onClick={onButtonClick}>닉네임 변경하기</button>
    </div>
  );
};
```

위 컴포넌트에서 버튼을 클릭하면, 닉네임 상태 변경이 UI에 반영되지 않습니다. 왜 리액트는 `nickName`의 상태가 변경되었다는 것을 알지 못할까요? 그 이유는 리액트가 `nickName`의 상태가 변경되었다는 것을 알지 못하기 때문입니다. `let` 키워드로 선언한 변수는 함수 내부에서 선언한 **단순한 지역 변수**일 뿐, **리액트의 상태 관리 매커니즘과 연결되어 있지 않습니다.**

리액트에서 상태를 변경하는 방법은 **오직 리액트에서 제공하는 훅을 사용하는 것**입니다.

```jsx
import { useState } from "react";

const Component = () => {
  const [nickName, setNickName] = useState("harry");

  const onButtonClick = () => {
    setNickName("choi hyunwoong");
  };

  return (
    <div>
      <h2>{nickName}</h2>
      <button onClick={onButtonClick}>닉네임 변경하기</button>
    </div>
  );
};
```

리액트에서 제공하는 `useState` 훅을 사용하면, UI에 표현해야 하는 상태가 변경되었다는 것을 리액트에게 알려줄 수 있고 리액트는 컴포넌트를 렌더링하며 변경사항을 반영합니다. 핵심은 **리액트에게 상태가 변경되었다는 것을 알리는 것**입니다. 리액트에서 훅을 통해서만 상태를 변경할 수 있도록 제한하는 가장 큰 이유는 **상태 변경의 예측 가능성을 높이기 위해서**입니다.

상태가 변경되었는지 알 수 있는 가장 쉬운 방법은, **상태를 변경할 수 있는 방법을 오직 하나로 제한하는 것입**니다. 이러한 이유로 `useState` 훅을 사용하는 경우에는 `setState`로 제한하며, `useReducer` 훅을 사용하는 경우에는 `dispatch`로 제한합니다. 이러한 이유 외에도 훅을 사용하면 리액트에게 상태를 관리하는 역할을 위임할 수 있으며 렌더링 최적화, 불변성 유지와 같은 장점을 누릴 수 있습니다.

렌더링 최적화에 대해 더 알고싶으시다면 [리액트 공식문서 - useMemo](https://ko.react.dev/reference/react/useMemo), [리액트 공식문서 - useCallback](https://ko.react.dev/reference/react/useCallback)에서 더 많은 내용을 확인할 수 있습니다. 리액트에서 불변성을 유지해야 하는 이유에 대해서 더 알고싶으시다면 [리액트 공식문서 - 객체 state 업데이트하기](https://ko.react.dev/learn/updating-objects-in-state#recap)에서 더 많은 내용을 확인할 수 있습니다.

## 리액트에서 숫자 상태 관리해 보기

리액트의 useState 훅을 활용해서 간단한 숫자 상태를 관리해 봅시다.

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  const increase = () => setCount(count + 1);

  return (
    <div>
      <p>현재 카운트: {count}</p>
      <button onClick={increase}>증가</button>
    </div>
  );
}
```

버튼을 클릭하면 상태를 변경하는 함수가 호출되고 `Counter` 컴포넌트를 다시 호출해서 변경된 상태를 UI에 반영합니다. 컴포넌트를 다시 호출하면 **위에서 부터 아래로 순차적으로 코드를 실행하면서 어떤 UI를 반환할지 결정**합니다.

<img src="https://github.com/user-attachments/assets/6cccb656-ca1f-48ff-8388-957b17af25b2" height="300px"/>

`Counter` 컴포넌트를 호출할 때마다 `useState`는 항상 0을 인자로 전달합니다. 하지만, 어떻게 0을 UI에 표현하는 것이 아니라 변경된 상태를 UI에 표현할 수 있는 것일까요? 어떻게 다음 렌더링에서 사용할 상태값을 기억할 수 있는 것일까요?

## 상태를 기억할 수 있는 방법 간단하게 알아보기

위에서 상태는 컴포넌트의 기억 저장소라고 했었습니다. 리액트에서는 [자바스크립트 클로저](https://developer.mozilla.org/ko/docs/Web/JavaScript/Closures) 개념을 활용해서 상태를 기억할 수 있도록 합니다. 간단하게 useState를 직접 구현해 보며 어떻게 상태를 기억할 수 있는 것인지 알아봅시다. 이 과정은 개념을 이해하기 위한 것이므로, **실제 리액트의 내부 구현과는 차이가 있을 수 있습니다.**

```jsx
import render from "./render";

export const { useState } = (function CustomReact() {
  const hooks = [];

  let hookIndex = 0;

  function useState(initialState) {
    const state = hooks[hookIndex] || initialState;

    hooks[hookIndex] = state;

    const setState = (() => {
      const currentHookIndex = hookIndex;

      return (newState) => {
        hooks[currentHookIndex] = newState;

        hookIndex = 0;

        render();
      };
    })();

    hookIndex += 1;

    return [state, setState];
  }

  return { useState };
})();
```

### 코드 레벨 설명

- **`hooks` 배열**: 모든 훅의 상태를 저장하는 곳입니다.
- **`hookIndex` 변수**: 현재 어떤 훅이 호출되고 있는지 추적합니다.

### useState 함수의 동작 살펴보기

1. **현재 인덱스 저장**: `currentIndex`에 현재 `hookIndex` 값을 저장합니다.
2. **상태 초기화 또는 가져오기:** `hooks[currentIndex]`에 값이 있으면 그 값을 사용하고, 없으면 `initialState`로 초기화합니다.
3. **`setState` 함수 정의**:
   - `currentIndex`를 참조하고 있기 때문에, 기억할 수 있습니다.
   - `hooks[currentIndex]`에 새로운 상태를 저장합니다.
   - `hookIndex`를 0으로 리셋하여 다음 렌더링 시 인덱싱을 처음부터 시작합니다.
   - `render()` 함수를 호출하여 컴포넌트를 다시 렌더링합니다.
4. **`hookIndex` 증가**: 다음 훅을 위해 인덱스를 1 증가시킵니다.
5. **상태와 `setState` 반환**: 현재 상태와 상태를 업데이트하는 함수를 반환합니다.

간단하게 구현한 useState 훅을 통해서 확인할 수 있듯, 리액트 컴포넌트는 클로저를 이용해 이전 상태를 기억할 수 있게 됩니다. useReducer 또한 상태를 변경할 수 있는 훅이며, 사용하기 좋은 상황, 사용법만 다르며 useState와 비슷한 역할을 하는 훅입니다. [리액트 공식문서 - useReducer](https://ko.react.dev/reference/react/useReducer)

## 지역 상태?

`useState`, `useReducer` 훅을 사용해서 상태를 관리하는 것은 컴포넌트 내부에 종속되는 지역 상태입니다. 상태는 그 상태를 소유하고 있는 소유주가 있고, 리액트에서는 컴포넌트가 상태의 소유주입니다. 상태는 각 컴포넌트 내부에서 독립적으로 소유, 관리됩니다.

<img src="https://github.com/user-attachments/assets/f2f1550f-f0ed-44de-9f35-150e3a977d23" height="400px" />

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  const increase = () => setCount(count + 1);

  return (
    <div>
      <p>현재 카운트: {count}</p>
      <button onClick={increase}>증가</button>
    </div>
  );
}
```

앞선 Counter 컴포넌트는 `count` 상태의 소유주 입니다.

```jsx
import { useState } from "react";

function App() {
  return (
    <div>
      <Counter />
      <Counter />
    </div>
  );
}
```

<img src="https://github.com/user-attachments/assets/8ac7c607-b3e9-4619-aa62-9ef16fedc9dd" height="400px" />

App 컴포넌트에서 두 개의 Counter 컴포넌트를 호출해서 사용하면, 각 Counter 컴포넌트 내부에 있는 count 상태는 각각 독립적으로 관리됩니다. 만약 두 개의 독립적인 count로 관리하는 것이 아니라 상태를 공유해야 한다면 어떻게 할 수 있을까요? 이런 문제를 해결하기 위해서는, 상태를 끌어올리는 방법과 Context API를 활용하는 방법이 있습니다.

## 상태 끌어올리기(State Lifting)

기존의 `Counter` 컴포넌트를 수정하여 두 개의 컴포넌트가 동일한 상태를 공유하도록 해보겠습니다.

```jsx
import { useState } from "react";

function Counter({ count, onIncrement }) {
  return (
    <div>
      <p>현재 카운트: {count}</p>
      <button onClick={onIncrement}>증가</button>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => setCount(count + 1);

  return (
    <div>
      <Counter count={count} onIncrement={handleIncrement} />
      <Counter count={count} onIncrement={handleIncrement} />
    </div>
  );
}
```

w각 `Counter` 컴포넌트에서 관리하던 count 상태를 기존 부모 컴포넌트였던 **App 컴포넌트로 끌어올렸고,** **동일한 count 상태**를 props로 받도록 수정했습니다. 이제 두 `Counter` 컴포넌트는 동일한 두 count 상태를 공유할 수 있습니다.

<img src="https://github.com/user-attachments/assets/fce9028a-6d1a-4c64-bf52-55fca04594f5" height="400px"/>

- 여러 컴포넌트가 동일한 데이터를 사용해야할 때
- 데이터의 일관성을 유지해야할 때
- 한 컴포넌트 내부에서 사용자의 행동으로 상태가 변경될 때, 다른 컴포넌트도 해당 변경을 반영해야할 때

위 상황에서, 상태 끌어올리기를 사용할 수 있습니다.

## Context API 사용하기

상태 끌어올리기는 간단하고 효과적인 방법이지만, 컴포넌트 트리 계층이 깊어질수록 **props drilling** 문제가 발생할 수 있습니다. 이는 필요하지 않은 중간 컴포넌트들이 단순히 props를 전달하기 위해 복잡해지는 현상입니다. 이러한 문제를 해결하기 위해 리액트는 **Context API**를 제공합니다.

```jsx
import { createContext, useState, useContext } from "react";

const CountContext = createContext();

function Counter() {
  const { count, onIncrement } = useContext(CountContext);

  return (
    <div>
      <h2>{count}</h2>
      <button onClick={onIncrement}>증가</button>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => setCount(count + 1);

  return (
    <CountContext.Provider value={{ count, onIncrement: handleIncrement }}>
      <div>
        <Counter />
        <Counter />
      </div>
    </CountContext.Provider>
  );
}
```

이제 props를 사용하지 않고도 count 상태를 공유할 수 있습니다. `<CountContext.Provider … />` 와 `useContext` 훅을 사용하여 **모든 하위 컴포넌트들에게 상태와 상태를 변경할 수 있는 권한을 공유**해줄 수 있습니다.

<img src="https://github.com/user-attachments/assets/bcd688df-b0c6-4510-bbc3-a6c9abd0cd32" height="400px"/>

- 앱 전반에 걸친 데이터 공유가 필요할 때
- 데이터를 공유하는 컴포넌트 트리 구조가 너무 깊고 복잡할 때

위 상황에서 Context API를 사용할 수 있습니다. Context API에 대해서 더 자세하게 학습하고 싶다면 [리액트 공식문서 - Context를 사용해 데이터를 깊게 전달하기](https://ko.react.dev/learn/passing-data-deeply-with-context)를 읽어보세요.

## Context API는 사실, 상태 관리 도구가 아니다

Context API를 사용하면 props drilling 문제를 해결하면서 컴포넌트 트리에서 데이터를 깊은 곳 까지 전달해 줄 수 있습니다. 하지만, Context API는 사실 상태 관리 도구가 아니라는 것을 인식하고 사용하는 것이 중요합니다. 공식문서에서 어디에서도 Context API가 상태를 관리해준다는 내용을 찾을 수 없습니다.

그 이유에 대해서 잠깐 짚고 넘어가자면 Context API는 useState, useReducer와 같이 상태를 관리해 주는 함수를 사용할 수 있도록 제공해 주는 것이 아니라 그저 두 훅을 호출한 결과를 자식 컴포넌트들이 필요할 때마다 뽑아서 사용할 수 있도록 해줄 뿐입니다. **상태를 어떻게 변경할지에 대한 로직은 Context API에 포함되어 있지 않습니다.**

아래 예시를 통해서 Context API가 상태 관리 도구가 아니라는 것을 모달 UI의 렌더링 상태를 관리하는 예시를 통해 자세히 알아봅시다.

```jsx
const ModalProvider = ({ children }) => {
  const [show, setShow] = useState(false);

  return (
    <ModalContext.Provider value={[show, setShow]}>
      {children}
    </ModalContext.Provider>
  );
};

const ModalToggleButton = () => {
  const [, setShow] = useContext(ModalContext);

  const toggleModalShow = () => setShow((prevState) => !prevState);

  return (
    <button onClick={toggleModalShow}>
      누르면 모달 렌더링 여부 상태가 변경됩니다.
    </button>
  );
};

const Modal = () => {
  const [show] = useContext(ModalContext);

  return show ? <div>해리모달</div> : null;
};

const App = () => {
  return (
    <ModalProvider>
      <Modal />
      <ModalToggleButton />
    </ModalProvider>
  );
};
```

위 코드는 모달을 렌더링할 수 있는 `<ModalToggleButton />` 과 모달 UI를 그리는 `<Modal />` 컴포넌트를 분리했고 각 컴포넌트에서 필요한 상태, 함수만 꺼내서 사용하고 있습니다. 위 예시 코드에서 버튼 컴포넌트는 모달 렌더링 여부만 결정하는 책임을 가지고 있고, 모달이 보일지 말지에 대한 **show 상태는 참조할 필요가 없습니다.**

하지만, 같은 컨를 참조하는 컴포넌트는 상태가 변경될 때마다 모두 렌더링 되기 때문에 상태를 참조할 필요가 없는 버튼 컴포넌트 또한 렌더링합니다. 렌더링 될 필요가 없는 컴포넌트를 필터링 하는 것은 Context API의 책임이 아닙니다. **상태 관리에 대한 책임을 전혀 가지고 있지 않습니다.**

```jsx
const ModalProvider = ({ children }) => {
  const [show, setShow] = useState(false);

  return (
    <ModalStateContext.Provider value={show}>
      <ModalDispatchContext.Provider value={setShow}>
        {children}
      </ModalDispatchContext.Provider>
    </ModalStateContext>
  )
}
```

모달 상태를 참조하는 컨텍스트, 모달 상태를 변경하는 컨텍스트를 구분해 두 개의 컨텍스트를 생성하고

```jsx
const ModalToggleButton = () => {
  const setShow = useContext(ModalDispatchContext);

  return (
    <button onClick={() => setShow((state) => !state)}>
      누르면 모달 렌더링 여부 상태가 변경됩니다.
    </button>
  );
};
```

버튼 컴포넌트에서는 상태를 변경하는 컨텍스트만 참조하도록 하면 불필요한 렌더링은 막을 수 있습니다. 하지만 매번 이렇게 두 개의 프로바이더를 사용한다면 코드의 복잡성을 야기하고 가독성을 해칠 수 있습니다.

```jsx
return (
    <ModalStateContext.Provider value={show}>
      <ModalDispatchContext.Provider value={setShow}>
        <ToastStateContext.Provider value={show}>
          <ToastDispatchContext.Provider value={setShow}>
          {//...}
          </ToastDispatchContext.Provider>
        </ToastStateContext.Provider>
      </ModalDispatchContext.Provider>
    </ModalStateContext>
)
```

기존의 모달 컨텍스트만 있던 것에서, 토스트 컨텍스트만 추가했음에도 불구하고 코드의 구조가 굉장히 복잡해진 것을 확인할 수 있습니다. 이 현상을 provider hell이라고 합니다. [The React Context hell](https://dev.to/alfredosalzillo/the-react-context-hell-7p4) 블로그 내용에서 더 자세한 내용을 확인할 수 있습니다.
