---
author: "alstn113"
generation: 6
level: "technical-writing"
original_filename: "level4.md"
source: "https://github.com/woowacourse/woowa-writing/blob/d732ab1cd6c4080b23f39c200d58617f881a323c/level4.md"
source_path: "level4.md"
---

# 연관관계에서 자식 객체들을 한 번에 삭제하는 방법들

![jpa](https://raw.githubusercontent.com/woowacourse/woowa-writing/d732ab1cd6c4080b23f39c200d58617f881a323c/img/%EC%97%B0%EA%B4%80%EA%B4%80%EA%B3%84.png)

## 들어가면서

안녕하세요. 우아한테크코스 6기 백엔드 구름 ⛅️ 입니다.

팀 프로젝트로 `데벨업`이라는 서비스를 개발하고 있어요.

데벨업은 개발 취준생들이 제공되는 문제를 풀고, 풀이를 공유하며 댓글로 소통할 수 있는 서비스입니다. 저희 서비스에서 풀이를 삭제하면 댓글들도 함께 삭제 처리해요.@OneToMany 연관관계에서 CascadeType.REMOVE와 orphanRemoval=true를 이용해 풀이가 삭제되면 댓글들도 함께 삭제되도록 구현했어요. 하지만 댓글들이 한 번에 삭제되지 않고, 하나씩 삭제되는 문제점이 있었는데요. 이 경우 댓글이 많아지면 삭제 시간이 오래 걸리고, 성능에 영향을 줄 수 있어요. 이 문제를 해결하기 위해 연관관계에서 자식 객체들을 한 번에 삭제하는 방법들에 대해 알아보고자 합니다.

## 본론

### CASCADE.REMOVE와 orphanRemoval=true에 대해 알아보자

먼저, 제가 처음에 사용했던 CascadeType.REMOVE와 orphanRemoval=true 방법에 대해 알아볼게요.

Cascade는 부모 엔티티의 영속성 상태 변화를 자식 엔티티에 전파하는 옵션입니다. Cascade의 종류에는 PERIST, MERGE, REMOVE, REFRESH, DETACH가 있고, 이 모두를 포함하는 ALL 옵션이 있습니다. CascadeType.REMOVE는 부모 엔티티가 삭제될 때 자식 엔티티도 함께 삭제되도록 하는 옵션입니다. 부모 엔티티를 삭제할 때, JPA는 해당 부모와 연관된 모든 자식 엔티티를 찾아서 삭제합니다. 이 과정은 데이터베이스의 외래 키 제약 조건을 따르며, 부모가 삭제되기 전에 자식이 먼저 삭제됩니다.

orphanRemoval=true는 부모 엔티티와 연관된 자식 엔티티가 더 이상 참조되지 않을 때, 자동으로 삭제되도록 하는 옵션입니다. 이 옵션은 CascadeType.REMOVE와 다르게 부모 엔티티가 삭제되지 않아도 자식 엔티티가 삭제됩니다. 이 옵션은 부모 엔티티와 자식 엔티티의 연관 관계를 끊을 때 사용합니다. 쉽게 말해서 부모 엔티티의 자식 엔티티 컬렉션에서 자식 엔티티를 제거하면, 자식 엔티티가 삭제됩니다.

부모 엔티티가 삭제될 때 자식 엔티티들도 함께 삭제되는지 테스트를 통해서 확인해 보겠습니다.

PostV1과 CommentV1 엔티티를 만들었고, 두 엔티티는 @OneToMany 연관관계로 연결되어 있습니다.
PostV1 엔티티를 삭제하면 CommentV1 엔티티도 함께 삭제되도록 CascadeType.REMOVE와 orphanRemoval=true를 설정했습니다.

> CascadeType.PERSIST는 부모 엔티티가 영속 상태가 될 때 자식 엔티티도 함께 영속 상태가 되도록 하는 옵션입니다.
> addComment 메서드와 함께 PostV1이 저장될 때 CommentV1도 함께 저장되도록 편의를 위해서 추가했습니다.

```java
@Entity
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@Getter
public class PostV1 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "post", cascade = {CascadeType.PERSIST, CascadeType.REMOVE}, orphanRemoval = true)
    private List<CommentV1> comments = new ArrayList<>();

    public void addComment(CommentV1 comment) {
        this.comments.add(comment);
        comment.updatePost(this);
    }
}

@Entity
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@Getter
public class CommentV1 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private PostV1 post;

    public void updatePost(PostV1 post) {
        this.post = post;
    }
}
```

@DataJpaTest를 이용해서 테스트를 진행했고, PostV1 엔티티를 삭제하면 연관관계인 CommentV1 엔티티도 함께 삭제되는 것을 알 수 있습니다.

> 참고로 @DataJpaTest는 @Transactional이 기본적으로 포함되어 있어 영속성 컨텍스트에 대해서 주의해야 합니다.

```java
@Test
void test() {
    // given
    PostV1 post = new PostV1();
    CommentV1 comment1 = new CommentV1();
    CommentV1 comment2 = new CommentV1();
    post.addComment(comment1);
    post.addComment(comment2);
    postRepository.save(post);

    // when
    postRepository.delete(post);

    // then
    assertThat(postRepository.findAll()).isEmpty(); // ok!
    assertThat(commentRepository.findAll()).isEmpty(); // ok!
}
```

이 방법의 문제점은 처음에 말했던 것처럼 자식 엔티티가 한 번에 삭제되지 않고, 하나씩 삭제된다는 것입니다.

```sql
[Hibernate]
    delete
    from
        commentv1
    where
        id=?
[Hibernate]
    delete
    from
        commentv1
    where
        id=?
[Hibernate]
    delete
    from
        postv1
    where
        id=?
```

그렇다면 자식 엔티티들을 한 번에 삭제하는 방법들에는 어떤 것들이 있을까요?

### @OnDelete(action = OnDeleteAction.CASCADE)

ON DELETE CASCADE는 외래 키 제약 조건을 설정할 때 사용하는 옵션으로, 부모 엔티티가 삭제될 때 자식 엔티티도 함께 삭제되도록 하는 옵션입니다. 이 옵션은 데이터베이스에서 외래 키 제약 조건을 설정할 때 사용하며, Hibernate에서 제공하는 @OnDelete(action = OnDeleteAction.CASCADE)를 사용하면 외래 키 제약 조건을 설정할 수 있습니다.
@ManyToOne 어노테이션에 @OnDelete(action = OnDeleteAction.CASCADE)를 추가하여 적용할 수 있습니다.

```java
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@Getter
public class CommentV2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private PostV2 post;

    public void updatePost(PostV2 post) {
        this.post = post;
    }
}
```

ON DELETE CASCADE는 DDL 생성 시에 외래 키 제약 조건을 설정하므로, 데이터베이스에 외래 키 제약 조건이 설정되어 있어야 합니다.
이 방법은 데이터베이스에 외래 키 제약 조건을 설정하므로, 데이터베이스에 의존적이라는 단점이 있습니다.

```sql
[Hibernate]
    alter table if exists commentv2
       add constraint FKr0bihhf172cw19w7k7rg2axg8
       foreign key (post_id)
       references postv2
       on delete cascade // 이 부분이 추가된다.
```

PostV2 엔티티를 삭제할 때 데이터베이스는 내부적으로 연관된 CommentV2 엔티티들을 한 번에 삭제하는 것을 확인할 수 있습니다.

### deleteAll(...)과 deleteAllInBatch(...)

deleteAll(...)과 deleteAllInBatch(...)는 JpaRepository에서 제공하는 메서드로, 모든 엔티티를 삭제하는 메서드입니다.
deleteAll(...)은 내부적으로 delete를 호출하여 엔티티를 하나씩 찾고 삭제하는 방식이기 때문에 한 번에 삭제되지 않습니다.
deleteAllInBatch(...)는 조회하지 않고, 여러 엔티티를 한 번에 삭제하는 DELETE 쿼리를 실행하는 방식이기 때문에 한 번에 삭제됩니다.

테스트를 통해 알아보겠습니다.

```java
    @Test
    void test() {
        // given
        PostV3 post = new PostV3();
        CommentV3 comment1 = new CommentV3();
        CommentV3 comment2 = new CommentV3();
        post.addComment(comment1);
        post.addComment(comment2);
        postRepository.save(post);

        // when
        commentRepository.deleteAllInBatch(post.getComments());

        // then
        assertThat(postRepository.findAll()).hasSize(1);
        assertThat(commentRepository.findAll()).isEmpty();
    }
```

deleteAllInBatch(...)를 사용하면 CommentV3 엔티티들이 or을 사용한 DELETE 쿼리로 한 번에 삭제되는 것을 확인할 수 있습니다.

```sql
[Hibernate]
    delete
    from
        commentv3 cv1_0
    where
        cv1_0.id=?
        or cv1_0.id=?
```

### JPQL과 @Modifying(clearAutomatically = true)

@Query(JPQL)과 @Modifying을 통해서 자식 엔티티들을 한 번에 삭제할 수 있습니다. @Modifying은 DML 쿼리를 실행할 때 사용하는 어노테이션으로, JPQL에서 UPDATE, DELETE 쿼리를 실행할 때 사용합니다. 이 어노테이션이 없으면 SPRING DATA JPA는 해당 쿼리를 읽기 전용으로 인식하고, 예외를 발생시킵니다. JPQL은 실행 전에 flush를 호출하여 영속성 컨텍스트와 데이터베이스를 동기화합니다. 참고로 flush를 해도 영속성 컨텍스트는 초기화되지 않습니다. JPQL은 데이터베이스에 직접 쿼리를 날리기 때문에 벌크 연산 후 영속성 컨텍스트와 데이터베이스가 다를 수 있습니다. @Modifying(clearAutomatically = true)를 사용하면 벌크 연산 후 영속성 컨텍스트를 초기화하여 데이터베이스와 동기화할 수 있습니다.

```java
public interface CommentV4Repository extends JpaRepository<CommentV4, Long> {

    @Query("delete from CommentV4 c where c.post.id = :postId")
    @Modifying(clearAutomatically = true)
    void deleteAllByPostId(Long postId);
}
```

### 장점과 단점 비교

- CascadeType.REMOVE와 orphanRemoval=true

  - 장점: 부모 객체가 삭제될 때 자식 객체도 함께 삭제되어, 부모 객체의 생명 주기에 따라 자식 객체의 생명 주기를 쉽게 관리할 수 있고, 객체 지향적이다.
  - 단점: 자식 엔티티가 한 번에 삭제되지 않고, 하나씩 삭제된다.

- @OnDelete(action = OnDeleteAction.CASCADE)

  - 장점: 조회 쿼리 없이 한 번에 삭제할 수 있어 효율적이다. 데이터베이스에서 자동으로 삭제하므로 개발자가 개입할 필요가 없다.
  - 단점: `ON DELETE CASCADE`를 지원하는 데이터베이스에 의존적이다. 삭제 과정에서 데이터베이스의 무결성을 해칠 위험이 있다.

- deleteAllInBatch(...)

  - 장점: 조회 쿼리 없이 한 번에 삭제할 수 있어 효율적이다.
  - 단점: 영속성 컨텍스트와 데이터베이스가 동기화되지 않아, 삭제 후 조회 시 주의가 필요하다.

- JPQL과 @Modifying(clearAutomatically = true)
  - 장점: 불필요한 조회 쿼리가 없고, 벌크 연산으로 한 번에 삭제할 수 있어 효율적이다.
  - 단점: 쿼리 작성이 필요하여 코드가 복잡해질 수 있다.

## 결론

연관관계에서 자식 객체들을 한 번에 삭제해서 성능을 최적화하는 방법들을 알아봤습니다. 저희 서비스에서는 JPQL과 @Modifying(clearAutomatically = true)를 사용해서 자식 객체들을 한 번에 삭제하는 방법을 선택했습니다. 이 방법은 불필요한 조회 쿼리가 없고, 벌크 연산으로 한 번에 삭제할 수 있어 효율적이기 때문입니다. 또한, 데이터베이스에 의존적이지 않고, 영속성 컨텍스트와 데이터베이스를 동기화할 수 있어서 안정적이라고 생각했습니다.

추가로 실무에서는 데이터를 삭제하는 것이 문제가 될 수 있기 때문에 데이터를 물리적으로 삭제하기 전에 논리적으로 삭제하는 방법을 고려해야 합니다. 또한 삭제 작업에 대한 로그를 기록하고, 감사(Audit) 기능을 구현하는 방법을 배우는 것도 중요합니다. 이는 데이터 변경 이력을 추적하고, 보안 및 규정 준수에 도움이 됩니다. 이 부분에 대해서 찾아보고, 공부해 보면 많은 도움이 될 것 같습니다.

감사합니다 ⛅️

## 참고

- [영속성 전이 주의 사항](https://resilient-923.tistory.com/417)
- [deleteAll() vs deleteAllInBatch](https://ssdragon.tistory.com/115)
- [CascadeType.REMOVE, orphanRemoval=true](https://tecoble.techcourse.co.kr/post/2021-08-15-jpa-cascadetype-remove-vs-orphanremoval-true/)
- [@OnDelete(action = OnDeleteAction.CASCADE)](https://velog.io/@joon6093/cascade-Delete)
- [삭제 방법들](https://velog.io/@calaf/OndeleteCascade-vs-deleteAllInBatch-어느것을-택해야-할까)
