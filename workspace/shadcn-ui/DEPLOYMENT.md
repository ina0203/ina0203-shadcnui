# GitHub Pages 배포 가이드

이 프로젝트를 GitHub Pages에 배포하는 방법입니다.

## 사전 준비

1. **GitHub 계정**이 있어야 합니다
2. **Git**이 설치되어 있어야 합니다

## 배포 단계

### 1. GitHub 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. 우측 상단의 `+` 버튼 클릭 → `New repository` 선택
3. 저장소 이름 입력 (예: `shadcn-ui` 또는 원하는 이름)
4. Public으로 설정
5. `Create repository` 클릭

### 2. vite.config.ts 수정

`vite.config.ts` 파일에서 `base` 경로를 저장소 이름으로 수정하세요:

```typescript
base: mode === 'production' ? '/저장소이름/' : '/',
```

예를 들어, 저장소 이름이 `my-app`이라면:
```typescript
base: mode === 'production' ? '/my-app/' : '/',
```

### 3. Git 원격 저장소 연결

터미널에서 다음 명령어를 실행하세요 (저장소 URL을 본인의 것으로 변경):

```bash
# 원격 저장소 추가
git remote add origin https://github.com/사용자명/저장소이름.git

# 또는 이미 원격 저장소가 있다면
git remote set-url origin https://github.com/사용자명/저장소이름.git
```

### 4. 변경사항 커밋 및 푸시

```bash
# 모든 변경사항 추가
git add .

# 커밋
git commit -m "GitHub Pages 배포 설정 추가"

# GitHub에 푸시
git push -u origin master
```

### 5. GitHub Pages 활성화

1. GitHub 저장소 페이지로 이동
2. `Settings` 탭 클릭
3. 왼쪽 메뉴에서 `Pages` 클릭
4. **Source** 섹션에서:
   - Source: `GitHub Actions` 선택
5. 저장

### 6. 배포 확인

1. 저장소의 `Actions` 탭으로 이동
2. 워크플로우가 실행되는 것을 확인
3. 완료되면 다음 URL에서 사이트 확인:
   ```
   https://사용자명.github.io/저장소이름/
   ```

## 자동 배포

이제 `master` 브랜치에 푸시할 때마다 자동으로 GitHub Pages에 배포됩니다!

## 로컬에서 빌드 테스트

배포 전에 로컬에서 프로덕션 빌드를 테스트하려면:

```bash
# 빌드
pnpm run build

# 빌드된 파일 미리보기
pnpm run preview
```

## 문제 해결

### 404 에러가 발생하는 경우
- `vite.config.ts`의 `base` 경로가 저장소 이름과 일치하는지 확인
- GitHub Pages 설정에서 Source가 `GitHub Actions`로 되어 있는지 확인

### 스타일이 적용되지 않는 경우
- 브라우저 개발자 도구에서 CSS 파일 경로 확인
- `base` 경로 설정이 올바른지 확인

### Actions 워크플로우가 실행되지 않는 경우
- 저장소 Settings → Actions → General에서 Actions 권한 확인
- Workflow permissions를 "Read and write permissions"로 설정
