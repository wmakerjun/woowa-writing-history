---
author: "novice0840"
generation: 6
level: "technical-writing"
original_filename: "technical-writing.md"
source: "https://github.com/woowacourse/woowa-writing/blob/c12b2e5f16e7a44035504059943150d6b0038547/technical-writing.md"
source_path: "technical-writing.md"
---

# [Git] Github에서 서로 다른 branch를 합치는 방법에는 무엇이 있을까?

# 서론

사람들과 팀 프로젝트를 하게 되면 `형상 관리 툴`을 필수적으로 사용하게 되고 그 중 가장 대중적인 툴이 `Git`라는 프로그램입니다. 이 `Git`을 사용해 사람들과 협업을 할려면 원격에 저장소를 두고 소스 코드를 공유해야 하는데 이 때 가장 대표적으로 사용되는 것이 `Github`입니다.

팀원들이 각자가 담당한 기능을 각자가 생성한 branch를 하나로 합치기 위해서는 merge 작업을 거쳐야 한다. 그렇다면 Github에서 branch를 합치는 방법에는 무엇이 있을까요?

Github에서 작성한 PR(Pull Request)를
아래와 같은 3가지 방법이 나옵니다.

![](https://velog.velcdn.com/images/magnolia0840/post/8bbde924-b0d2-424b-8f32-c23a6460ca53/image.png)

위 merge 방법들은 어떤식으로 동작하며 어떤 차이가 있을까요?

> 앞으로 나오는 실습 내용들은 프로젝트와 유사한 환경을 만들기 위해 아래 조건을 전제로 진행합니다.

1. 이 글에서의 merge는 Github에 올라간 PR 브랜치를 main 브랜치로 병합하는 것을 의미한다.
2. 소스 코드 충돌 해결은 Github 가 아닌 로컬 IDE에서 진행한다.

# Merge Commit

![](https://velog.velcdn.com/images/magnolia0840/post/86bbc997-8b3b-453b-95d6-753486958ef5/image.png)

## Merge Commit 개념 설명

기본적으로 `recursive merge` 방식을 사용하며 GitHub에서 두 브랜치를 병합할 때, 각 브랜치의 작업을 그대로 유지하며 하나의 새로운 **병합 커밋**을 생성합니다.

두 브랜치의 히스토리가 모두 보존되고, 병합이 명확히 표시된다. 병합 충돌이 발생할 경우, 이를 수동으로 해결한 후 병합할 수 있다.

## Merge Commit 실습

Github에 실습을 위한 git-test 저장소를 만들고 local에 다운받습니다. 그리고 commit을 2개를 만들고 Github에서 PR을 작성합니다.

![](https://velog.velcdn.com/images/magnolia0840/post/311cc13d-d3fc-4cc7-ba6f-4e0346f1e33d/image.png)

당연히 main 브랜치에는 추가적인 작업을 하지 않았기 때문에 바로 merge가 가능합니다.

![](https://velog.velcdn.com/images/magnolia0840/post/7357fbf9-9f7d-47fc-8448-8f5949834e71/image.png)

이제 main 브랜치도 이동해 commit을 추가해보겠습니다.

![](https://velog.velcdn.com/images/magnolia0840/post/473ce7e5-294b-4ad0-8f7f-9ee158bd02d8/image.png)

아까와는 달리 브랜치에 분기가 생긴 것을 확인할 수 있습니다. main 브랜치에 commit이 추가되며 feat/#1 브랜치와 충돌이 생겨(의도적으로 충돌을 발생시키기 위해 같은 파일의 같은 라인에 코드를 추가함) 이제 충돌을 해결하기 전까지는 merge가 불가능하게 되었습니다.

![](https://velog.velcdn.com/images/magnolia0840/post/51f03b1b-0402-4e4e-8bc5-5e62d69318c2/image.png)

feat/#1 브랜치에서 아래 명령어를 사용해 main 브랜치의 코드를 가져옵니다.

```
git pull origin main
```

main 브랜치에서 feat/#1과 같은 라인의 코드를 작성했기 때문에 충돌이 발생합니다. 이제 로컬 환경에서 충돌을 해결하고 다시 commit을 추가합니다.

![](https://velog.velcdn.com/images/magnolia0840/post/220abaa3-1c7c-4bd2-b412-f0324750a919/image.png)

갈라졌던 분기가 다시 하나로 합쳐서 있는 것을 볼 수 있습니다. 물론 아직 브랜치가 합쳐진 것은 아닙니다. 이제 Github에서 브랜치를 합치겠습니다.

![](https://velog.velcdn.com/images/magnolia0840/post/c1ea32f1-8ea0-4017-b20f-0012923d6409/image.png)

아까는 충돌이 발생해 merge가 안되었었는데 이제는 merge가 가능합니다. merge 후 더 이상 feat/#1 브랜치는 사용하지 않으므로 삭제해 줍니다.

이제 Git graph를 보면 정상적으로 merge가 완료된 것을 확인할 수 있습니다.

![](https://velog.velcdn.com/images/magnolia0840/post/2d6ee5c6-05cb-45be-9ac1-f8b01daaf101/image.png)

그림을 보면
`merge pull request #6 from` commit과
`merge conflict 해결` commit, 두 개의 merge commit이 있다고 생각할 수도 있습니다.

이는 내 로컬 컴퓨터에서 충돌을 해결해서 발생한 현상입니다.
`merge conflict 해결`은 로컬 IDE에서 충돌을 해결할 때 만들어진 commit이고
`merge pull request #6 from`은 Github에서 실제 merge를 할 때 발생한 **merge commit**이다.

## Merge Commit 장단점

장점:

- 병합 히스토리 명확성: Merge commit은 브랜치 간의 병합이 언제 일어났는지 명확하게 기록해주며, 브랜치가 어디에서 파생되었고, 어떤 작업이 병합되었는지 확인하기 쉽습니다. 이로 인해 추적이 용이해집니다.

- 기존 commit history 보존: 각 브랜치의 모든 커밋 기록을 그대로 유지하면서 병합할 수 있습니다. 작업 중에 발생한 모든 변경 사항과 그 과정을 보존할 수 있어, 협업 중에 각 작업의 흐름을 쉽게 파악할 수 있습니다.

- 충돌 해결 간소화: 병합 중 충돌이 발생해도, merge commit 방식은 충돌 해결을 한 번만 처리하면 됩니다. 브랜치 전체를 병합하는 과정에서 한 번의 충돌 해결로 모든 커밋을 병합할 수 있습니다.

- 협업에 안전: 리베이스와 달리 커밋의 해시를 변경하지 않으므로, 이미 공유된 브랜치의 히스토리가 변경되지 않습니다. 이로 인해 협업 과정에서 충돌이나 히스토리 손상이 발생하지 않습니다.

단점:

- 커밋 히스토리 복잡성 증가: 각 병합마다 새로운 병합 커밋이 추가되기 때문에, 프로젝트 규모가 커지면 커밋 히스토리가 복잡해질 수 있습니다. 브랜치가 자주 병합되면 병합 커밋이 많아져 커밋 로그가 지저분해 보일 수 있습니다.

- 불필요한 병합 커밋: 단순히 작은 변경 사항을 병합하는 경우에도 불필요한 병합 커밋이 생성되므로, 실제 코드 변경 사항보다 많은 커밋 로그가 남을 수 있습니다.

- 병합 그래프 복잡성: Git의 커밋 그래프가 복잡해질 수 있습니다. 여러 브랜치를 병합하는 과정에서 각 브랜치 간의 관계가 병합 커밋에 의해 시각적으로 복잡하게 얽히는 문제가 발생할 수 있습니다.

# Rebase and Merge

![](https://velog.velcdn.com/images/magnolia0840/post/f1c53a77-5189-4ecf-b659-20b716804072/image.png)

## Rebase and Merge 개념 설명

Rebase는 기본적으로 병합할 브랜치의 커밋을 다른 브랜치의 최신 커밋 위에 재배치하는 방식입니다.

이 방식은 커밋 히스토리를 다시 작성하여 직선적인 히스토리를 유지할 수 있습니다. Rebase and Merge는 두 브랜치의 히스토리를 직선으로 만들고, 병합 커밋을 생략하여 Git 히스토리가 깔끔하게 유지됩니다.

아래와 같이 2개의 브랜치가 있는 상태에서 `rebase and merge`를 하면

![](https://velog.velcdn.com/images/magnolia0840/post/f197864f-60b5-441e-86dd-a4e3bc155ef9/image.png)

하나의 브랜치가 된다.

![](https://velog.velcdn.com/images/magnolia0840/post/b8a58f6f-a43d-4e1c-9649-5048634481b8/image.png)

> X, Y, Z가 X', Y', Z'로 바뀐 이유는 commit이 옮겨지면서 commit의 hash 값이 달라지기 때문입니다. hash 값은 달라져도 소스 코드에 영향을 미치지는 않습니다.

## Rebase and Merge 실습

### 충돌이 발생하지 않는 경우

Git에서 main, feat 브랜치를 만들고 feat에서 commit을 하나 만들고 PR을 날려줍니다.

> 파란색: main branch
> 빨간색: feat branch

![](https://velog.velcdn.com/images/magnolia0840/post/190cc451-a427-47c2-a491-d97377cfca5b/image.png)

main 브랜치에 추가적인 commit이 작성되지 않았기 때문에 feat 브랜치는 문제 없이 main 브랜치로 `rebase and merge`가 가능합니다.

![](https://velog.velcdn.com/images/magnolia0840/post/0f814ae9-db96-4519-8b4a-7ba47d1af9f1/image.png)

혼자서 작업을 할 경우 main에 추가적인 commit이 쌓일 가능성이 없기 때문에 `rebase and merge`시에 문제가 발생할 가능성이 낮습니다.

하지만 내가 `feat branch`에서 작업을 하는 동안 다른 누군가의 추가 commit이 main 브랜치에 쌓인 다면?

![](https://velog.velcdn.com/images/magnolia0840/post/a2262d77-e1fb-4f35-9296-91c2e1915993/image.png)

물론 위 형태가 되더라도 충돌이 없는 경우에는 `Github`에서 문제 없이 `rebase and merge`가 가능합니다.

다만 `rebase`를 local에서 할 경우는 문제가 발생합니다.
local에서는 rebase를 하는 순간에 현재 commit이 main 브랜치의 마지막 commit의 위로 이동하지만 그 전에 올린 PR의 commit은 이동하지 않으므로 feat 브랜치가 local과 Github에서 둘로 갈라지게 되는 것입니다.

![](https://velog.velcdn.com/images/magnolia0840/post/07715743-dd46-4258-afaa-cd991de7efbf/image.png)

이 상태에서 `local feat commit`에서 `origin feat commit 1`으로 push를 하면 `commit history`가 다소 이상한 형태가 되어버립니다.

> `force push`를 하면 일자 모양의 `commit history`를 얻을 수는 있지만 `force push`는 `origin feat` 브랜치의 내용을 전부 무시하고 push 할 수 있지만 기본적으로 `force push`는 이전의 commit 기록들을 싸그리 무시하고 밀기 때문에 권장되지 않는 방식입니다.

![](https://velog.velcdn.com/images/magnolia0840/post/675f56e9-0172-4cef-8f20-8632e244bc78/image.png)

위 사진을 보면 `feat commit 1`이 2개가 있는 것을 볼 수 있습니다. 불필요한 commit이 2개 발생하기도 하고 애초에 `commit history를 깔끔하게 만들 수 있다`라는 rebase의 장점이 없어지기도 합니다.

### 충돌이 발생하는 경우

아까와 같은 상황에서 충돌이 발생한다면 어떻게 변할까요?

충돌 해결 후 Github에 push를 하면 `rebase and merge`가 불가능하여 `merge commit`으로 브랜치를 합쳐야합니다.

![](https://velog.velcdn.com/images/magnolia0840/post/207792d7-e6af-460e-aad2-306413e33953/image.png)

아까보다도 `git graph`가 더 복잡해졌습니다.

![](https://velog.velcdn.com/images/magnolia0840/post/123ec4f1-6aac-4f7c-b8f0-6b4dff736447/image.png)

각 commit이 생겨난 시점은 다음과 같다.

`Initial commit`: 가장 초기 commit <br>
`feat commit 1(초록색)`: feat 브랜치를 만들고 가장 처음 PR에 올라간 commit <br>
`feat commit 1(빨간색)`: 로컬 feat 브랜치에서 `git rebase main`을 했을 때 생긴 commit <br>
`rebase main`: 로컬에서 rebase 후 충돌을 해결한 commit <br>
`가장 위에 있는 파란색 commit`: Github에서 `merge commit`으로 브랜치를 합칠 때 생겨난 commit <br>

## Rebase and Merge 장단점

장점:

- commit history의 일관성: 리베이스를 통해 커밋 히스토리를 메인 브랜치에 병합하면, 브랜치가 병합된 흔적(merge commit)이 남지 않고, 마치 브랜치에서 작업한 내용이 연속적으로 추가된 것처럼 보입니다. 이로 인해 히스토리가 깔끔하고 일관성 있게 유지됩니다.

- 작업 흐름 유지: 리베이스를 사용하면 각 커밋의 세부 기록을 유지하면서, 마치 모든 작업이 메인 브랜치에서 연속적으로 이루어진 것처럼 히스토리가 나타납니다. 각 커밋의 순서를 보존하면서 병합할 수 있습니다.

단점:

- 히스토리 왜곡 가능성: 리베이스는 커밋의 베이스를 변경하는 작업이므로, 브랜치의 기존 히스토리가 변경됩니다. 협업 중에 다른 사람이 이 브랜치에서 작업하고 있으면, 그들의 작업 히스토리가 깨지거나 충돌이 발생할 수 있습니다.
- 협업 시 충돌 관리 어려움: 팀원들이 이미 리베이스한 브랜치에 대해 작업을 계속 진행하고 있을 때, 커밋 해시가 변경되어 충돌이나 혼동이 발생할 수 있습니다. 잘못된 리베이스는 복구가 어려울 수 있습니다.

# Squash and Merge

![](https://velog.velcdn.com/images/magnolia0840/post/ef66a9be-2585-4490-8f71-f599ff32d75c/image.png)

## Squash and Merge 개념 설명

Squash and Merge는 Git에서 여러 개의 커밋을 하나의 커밋으로 압축하여 병합하는 방식입니다. 위 그림과 같이 합치고자 하는 브랜치의 commit들을 하나로 묶어 압축 commit을 만든 후 병합합니다.

## Squash and Merge 실습

이번에는 위 그림의 Before 사진과 같이 5개의 commit을 만들어 보겠습니다.

![](https://velog.velcdn.com/images/magnolia0840/post/707704c2-a6dc-45a8-8eae-4ad5d62b0069/image.png)

이제 feat 브랜치의 PR을 만들고 Github에서 병합을 해보겠습니다.

![](https://velog.velcdn.com/images/magnolia0840/post/ec6a1f5f-eda7-4a71-b33f-c5a92a0ba65d/image.png)

`squash and merge`를 하는 시점에 `Feat(#10)`라는 새로운 commit이 생성되었고 해당 commit 안에 기존에 feat 브랜치에 있던 commit들이 들어가 있는 것을 확인할 수 있습니다.

## Squash and Merge 장단점

장점:

- 커밋 기록 간결화: 여러 개의 커밋을 하나로 합쳐 병합하면, 메인 브랜치의 커밋 로그가 깔끔하고 간결해집니다. 특히, 브랜치에서 여러 개의 작은 커밋이 발생한 경우 유용합니다.
- 불필요한 히스토리 제거: 작업 중 실수로 생성된 중간 커밋이나 불필요한 커밋을 병합할 때 히스토리에서 제거할 수 있어, 메인 브랜치의 히스토리가 더 명확해집니다.

단점:

- 세부 히스토리 손실: 모든 커밋이 하나로 합쳐지기 때문에 각 커밋의 세부적인 작업 내용이나 커밋 메세지를 유지할 수 없습니다. 각 작업 단계를 명확하게 기록해두고 싶은 경우 불리할 수 있습니다.
- 디버깅 어려움: 버그가 발생했을 때, 세부 커밋 기록이 사라지기 때문에 문제가 어디서 발생했는지 파악하는 데 시간이 더 걸릴 수 있습니다.

# 요약

![](https://velog.velcdn.com/images/magnolia0840/post/22d627c5-ae92-4443-853f-cf280d285973/image.png)

# 참고

https://codingapple.com/unit/git-rebase-squash/
