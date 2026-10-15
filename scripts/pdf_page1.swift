// Render page 1 of a PDF to a PNG and optionally dump the full text. macOS only (PDFKit).
//   swift scripts/pdf_page1.swift <in.pdf> <out.png> [--text out.txt] [--scale 3] [--bottom-frac 0.95]
// The image is cropped above the "Introduction" heading when it starts on page 1,
// otherwise at the last row of ink (plus a margin). --bottom-frac forces a crop at that
// fraction of the page height, measured from the top.
import PDFKit
import AppKit

let a = CommandLine.arguments
guard a.count >= 3, let doc = PDFDocument(url: URL(fileURLWithPath: a[1])), let page = doc.page(at: 0) else {
    FileHandle.standardError.write("usage: pdf_page1.swift in.pdf out.png [--text out.txt] [--scale 3] [--bottom-frac f]\n".data(using: .utf8)!)
    exit(2)
}
func opt(_ name: String) -> String? { if let i = a.firstIndex(of: name), i + 1 < a.count { return a[i + 1] }; return nil }
let scale = CGFloat(Double(opt("--scale") ?? "3") ?? 3)
let b = page.bounds(for: .mediaBox)

if let t = opt("--text") { try! (doc.string ?? "").write(toFile: t, atomically: true, encoding: .utf8) }

let w = Int(b.width * scale), h = Int(b.height * scale)
let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8, samplesPerPixel: 4,
                           hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
let ctx = NSGraphicsContext(bitmapImageRep: rep)!
NSGraphicsContext.saveGraphicsState(); NSGraphicsContext.current = ctx
NSColor.white.setFill(); NSRect(x: 0, y: 0, width: w, height: h).fill()
ctx.cgContext.scaleBy(x: scale, y: scale)
page.draw(with: .mediaBox, to: ctx.cgContext)
NSGraphicsContext.restoreGraphicsState()

// Choose the bottom edge, in pixels from the top.
var cut = h
if let f = opt("--bottom-frac"), let fv = Double(f) {
    cut = Int(Double(h) * fv)
} else {
    var introTop: CGFloat? = nil
    for s in doc.findString("Introduction", withOptions: [.caseInsensitive]) {
        if s.pages.first === page {
            let r = s.bounds(for: page)
            if r.maxY < b.height * 0.6 { introTop = max(introTop ?? 0, r.maxY) }   // heading sits below the abstract
        }
    }
    if let y = introTop { cut = Int((b.height - y) * scale) - Int(8 * scale) }
    // Trim trailing white rows.
    let px = rep.bitmapData!, bpr = rep.bytesPerRow
    var last = 0
    for y in stride(from: min(cut, h) - 1, through: 0, by: -1) {
        var ink = false
        for x in stride(from: 0, to: w, by: 2) {
            let o = y * bpr + x * 4
            if px[o] < 235 || px[o + 1] < 235 || px[o + 2] < 235 { ink = true; break }
        }
        if ink { last = y; break }
    }
    cut = min(cut, last + Int(24 * scale))
}
cut = max(1, min(cut, h))
let cropped = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: cut, bitsPerSample: 8, samplesPerPixel: 4,
                               hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
let c2 = NSGraphicsContext(bitmapImageRep: cropped)!
NSGraphicsContext.saveGraphicsState(); NSGraphicsContext.current = c2
rep.draw(at: NSPoint(x: 0, y: CGFloat(cut - h)))
NSGraphicsContext.restoreGraphicsState()
try! cropped.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2]))
print("\(w)x\(cut)")
