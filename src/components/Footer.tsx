export function Footer() {
  return (
    <footer className="bottom-0 w-full bg-background z-50 py-8 border-t-2 border-border">
      <div className="container mx-auto px-4">
        <div className="relative flex justify-center items-center">
          <div className="text-sm text-foreground">
            © {new Date().getFullYear()} timeXwise. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}