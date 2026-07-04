# EMFI 바로가기 브릿지 페이지

KB국민은행 EMFI(`https://emfi.kbstar.com/quics`) 페이지로 바로 이동시켜주는 모바일 브릿지 페이지입니다.

## 모드

상단 토글로 두 가지 모드를 전환할 수 있습니다.

1. **제휴사 코드**: 영문 대문자 + 숫자 5자리(`alianCoCd`)를 입력하면
   `page=C111966` 고정값으로 이동합니다.
2. **상품 목록**: 페이지 ID(`page`, 예: `C111966`)를 입력하면
   `alianCoCd=KBB01` 고정값으로 이동합니다.

선택한 모드는 브라우저에 저장되어 다음 방문 시에도 유지됩니다.

## 로컬 실행

정적 파일이므로 별도 빌드 없이 `index.html`을 브라우저로 열거나,
간단한 정적 서버로 실행하면 됩니다.

```bash
npx serve .
```

## 배포

이 브랜치(`claude/new-repository-setup-lfyf4v`, 저장소 기본 브랜치)에 반영되면
GitHub Pages(`.github/workflows/pages.yml`)를 통해 자동으로 배포됩니다.

배포 전, 저장소 Settings → Pages → Build and deployment → Source에서
**GitHub Actions**를 한 번 선택해야 최초 배포가 활성화됩니다.
