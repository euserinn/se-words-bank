import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">인증 오류</h1>
        <p className="text-muted-foreground mb-6">
          로그인 중 문제가 발생했습니다. 다시 시도해주세요.
        </p>
        <Link
          href="/auth/login"
          className="inline-block py-3 px-6 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
        >
          로그인 페이지로
        </Link>
      </div>
    </div>
  )
}
