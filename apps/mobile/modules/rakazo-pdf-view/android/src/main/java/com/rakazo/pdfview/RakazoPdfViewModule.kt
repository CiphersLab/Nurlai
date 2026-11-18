package com.nurlai.pdfview

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** A PDF drawn with the system PdfRenderer; Android's WebView cannot show one. */
class NurlaiPdfViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NurlaiPdfView")

    View(NurlaiPdfView::class) {
      Events("onLoadError")
      Prop("uri") { view: NurlaiPdfView, uri: String -> view.load(uri) }
      OnViewDestroys { view: NurlaiPdfView -> view.release() }
    }
  }
}
