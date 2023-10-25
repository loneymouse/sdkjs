var sdk_scripts = [
	"../../../../sdkjs/vendor/polyfill.js",
	"../../../../sdkjs/common/applyDocumentChanges.js",
	"../../../../sdkjs/common/AllFonts.js",
	"../../../../sdkjs/common/device_scale.js",
	"../../../../sdkjs/common/userinfo_parser.js",
	"../../../../sdkjs/common/browser.js",
	"../../../../sdkjs/common/skin.js",
	"../../../../sdkjs/common/errorCodes.js",
	"../../../../sdkjs/common/commonDefines.js",
	"../../../../sdkjs/common/docscoapicommon.js",
	"../../../../sdkjs/common/docscoapi.js",
	"../../../../sdkjs/common/spellcheckapi.js",
	"../../../../sdkjs/common/apiCommon.js",
	"../../../../sdkjs/common/SerializeCommonWordExcel.js",
	"../../../../sdkjs/vendor/string.js",
	"../../../../sdkjs/vendor/array.js",
	"../../../../sdkjs/common/editorscommon.js",
	"../../../../sdkjs/common/BulletPreviewDrawer.js",
	"../../../../sdkjs/common/HistoryCommon.js",
	"../../../../sdkjs/common/TableId.js",
	"../../../../sdkjs/common/TableIdChanges.js",
	"../../../../sdkjs/common/AdvancedOptions.js",
	"../../../../sdkjs/common/libfont/engine.js",
	"../../../../sdkjs/common/libfont/loader.js",
	"../../../../sdkjs/word/apiDefines.js",
	"../../../../sdkjs/common/collaborativeHistory.js",
	"../../../../sdkjs/common/CollaborativeEditingBase.js",
	"../../../../sdkjs/word/Editor/CollaborativeEditing.js",
	"../../../../sdkjs/common/macros.js",
	"../../../../sdkjs/common/apiBase.js",
	"../../../../sdkjs/common/apiBase_plugins.js",
	"../../../../sdkjs/word/apiCommon.js",
	"../../../../sdkjs/word/api.js",
	"../../../../sdkjs/word/api_plugins.js",
	"../../../../sdkjs/common/spell/spell.js",
	"../../../../sdkjs/common/zlib/zlib.js",
	"../../../../sdkjs/word/Editor/Table/TableLook.js",
	"../../../../sdkjs/cell/utils/utils.js",
	"../../../../sdkjs-forms/api.js",
	"../../../../sdkjs-forms/apiPlugins.js",
	"../../../../sdkjs/common/api/actionOnTimer.js",
	"../../../../sdkjs/common/api/tableStylesPreviewGenerator.js",
	"../../../../sdkjs/common/api/spellCheckSettings.js",
	"../../../../sdkjs/common/api/addTextSettings.js",
	"../../../../sdkjs/common/api/autoCorrectSettings.js",
	"../../../../sdkjs/common/api/firstLetterExceptions.js",
	"../../../../sdkjs/common/api/restrictionSettings.js",
	"../../../../sdkjs/common/nameMap.js",
	"../../../../sdkjs/common/downloaderfiles.js",
	"../../../../sdkjs/common/NumFormat.js",
	"../../../../sdkjs/common/SerializeChart.js",
	"../../../../sdkjs/common/libfont/common.js",
	"../../../../sdkjs/common/libfont/map.js",
	"../../../../sdkjs/common/libfont/rasterheap.js",
	"../../../../sdkjs/common/libfont/glyphstring.js",
	"../../../../sdkjs/common/libfont/character.js",
	"../../../../sdkjs/common/libfont/grapheme.js",
	"../../../../sdkjs/common/libfont/textshaper.js",
	"../../../../sdkjs/common/libfont/file.js",
	"../../../../sdkjs/common/libfont/manager.js",
	"../../../../sdkjs/common/stringserialize.js",
	"../../../../sdkjs/common/random.js",
	"../../../../sdkjs/common/hash/hash.js",
	"../../../../sdkjs/common/keychainstorage.js",
	"../../../../sdkjs/common/Drawings/Metafile.js",
	"../../../../sdkjs/common/libfont/textmeasurer.js",
	"../../../../sdkjs/common/Drawings/WorkEvents.js",
	"../../../../sdkjs/word/Editor/History.js",
	"../../../../sdkjs/common/Shapes/EditorSettings.js",
	"../../../../sdkjs/common/Shapes/Serialize.js",
	"../../../../sdkjs/common/Shapes/SerializeWriter.js",
	"../../../../sdkjs/common/Drawings/Hit.js",
	"../../../../sdkjs/common/Drawings/ArcTo.js",
	"../../../../sdkjs/common/Drawings/ColorArray.js",
	"../../../../sdkjs/common/Drawings/CommonController.js",
	"../../../../sdkjs/word/Editor/GraphicObjects/DrawingStates.js",
	"../../../../sdkjs/common/Drawings/DrawingsChanges.js",
	"../../../../sdkjs/common/Drawings/Format/Format.js",
	"../../../../sdkjs/common/Drawings/Format/CreateGeometry.js",
	"../../../../sdkjs/common/Drawings/Format/Geometry.js",
	"../../../../sdkjs/common/Drawings/Format/GraphicObjectBase.js",
	"../../../../sdkjs/common/Drawings/Format/Shape.js",
	"../../../../sdkjs/common/Drawings/Format/CnxShape.js",
	"../../../../sdkjs/common/Drawings/Format/Path.js",
	"../../../../sdkjs/common/Drawings/Format/Image.js",
	"../../../../sdkjs/common/Drawings/Format/GroupShape.js",
	"../../../../sdkjs/common/Drawings/Format/Data.js",
	"../../../../sdkjs/common/Drawings/Format/ChartSpace.js",
	"../../../../sdkjs/common/Drawings/Format/ChartFormat.js",
	"../../../../sdkjs/common/Drawings/Format/TextBody.js",
	"../../../../sdkjs/common/Charts/charts.js",
	"../../../../sdkjs/common/Charts/DrawingObjects.js",
	"../../../../sdkjs/common/Charts/3DTransformation.js",
	"../../../../sdkjs/common/Charts/ChartsDrawer.js",
	"../../../../sdkjs/common/Drawings/TrackObjects/AdjustmentTracks.js",
	"../../../../sdkjs/common/Drawings/TrackObjects/MoveTracks.js",
	"../../../../sdkjs/common/Drawings/TrackObjects/NewShapeTracks.js",
	"../../../../sdkjs/common/Drawings/TrackObjects/PolyLine.js",
	"../../../../sdkjs/common/Drawings/TrackObjects/ResizeTracks.js",
	"../../../../sdkjs/common/Drawings/TrackObjects/RotateTracks.js",
	"../../../../sdkjs/common/Drawings/TrackObjects/GeometryEditTrack.js",
	"../../../../sdkjs/common/Drawings/TrackObjects/Spline.js",
	"../../../../sdkjs/common/Drawings/TrackObjects/ConnectorTrack.js",
	"../../../../sdkjs/common/Drawings/DrawingObjectsHandlers.js",
	"../../../../sdkjs/common/Drawings/TextDrawer.js",
	"../../../../sdkjs/common/Drawings/Externals.js",
	"../../../../sdkjs/common/GlobalLoaders.js",
	"../../../../sdkjs/common/Controls.js",
	"../../../../sdkjs/common/Overlay.js",
	"../../../../sdkjs/common/Drawings/HatchPattern.js",
	"../../../../sdkjs/common/scroll.js",
	"../../../../sdkjs/vendor/iscroll.js",
	"../../../../sdkjs/vendor/delta.js",
	"../../../../sdkjs/vendor/minhash.js",
	"../../../../sdkjs/common/Scrolls/mobileTouchManagerBase.js",
	"../../../../sdkjs/word/Drawing/mobileTouchManager.js",
	"../../../../sdkjs/common/wordcopypaste.js",
	"../../../../sdkjs/common/intervalTree.js",
	"../../../../sdkjs/cell/model/WorkbookElems.js",
	"../../../../sdkjs/cell/model/Workbook.js",
	"../../../../sdkjs/cell/model/Serialize.js",
	"../../../../sdkjs/cell/model/CellInfo.js",
	"../../../../sdkjs/word/Editor/Paragraph/Run/FontClassification.js",
	"../../../../sdkjs/word/Editor/Paragraph/Run/FontCalculator.js",
	"../../../../sdkjs/word/Editor/Paragraph/Run/RunAutoCorrect.js",
	"../../../../sdkjs/word/Drawing/translations.js",
	"../../../../sdkjs/word/Editor/GraphicObjects/Format/ShapePrototype.js",
	"../../../../sdkjs/word/Editor/GraphicObjects/Format/ImagePrototype.js",
	"../../../../sdkjs/word/Editor/GraphicObjects/Format/GroupPrototype.js",
	"../../../../sdkjs/word/Editor/GraphicObjects/Format/ChartSpacePrototype.js",
	"../../../../sdkjs/common/Drawings/Format/GraphicFrame.js",
	"../../../../sdkjs/common/Drawings/Format/LockedCanvas.js",
	"../../../../sdkjs/word/Editor/GraphicObjects/GraphicObjects.js",
	"../../../../sdkjs/word/Editor/GraphicObjects/GraphicPage.js",
	"../../../../sdkjs/word/Editor/GraphicObjects/WrapManager.js",
	"../../../../sdkjs/word/Editor/DocumentContentElementBase.js",
	"../../../../sdkjs/word/Editor/ParagraphContentBase.js",
	"../../../../sdkjs/word/Editor/Comments.js",
	"../../../../sdkjs/word/Editor/CommentsChanges.js",
	"../../../../sdkjs/word/Editor/Bookmarks.js",
	"../../../../sdkjs/word/Editor/Styles.js",
	"../../../../sdkjs/word/Editor/StylesChanges.js",
	"../../../../sdkjs/word/Editor/RevisionsChange.js",
	"../../../../sdkjs/word/Editor/FlowObjects.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/Types.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/Base.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/FootnoteReference.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/FootnoteRef.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/EndnoteReference.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/EndnoteRef.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/Separator.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/ContinuationSeparator.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/PageNum.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/PagesCount.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/Break.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/Text.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/Space.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/Tab.js",
	"../../../../sdkjs/word/Editor/Paragraph/RunContent/ParagraphMark.js",
	"../../../../sdkjs/word/Editor/ParagraphContent.js",
	"../../../../sdkjs/word/Editor/Paragraph/ParaTextPr.js",
	"../../../../sdkjs/word/Editor/Paragraph/ParaTextPrChanges.js",
	"../../../../sdkjs/word/Editor/Paragraph/ParaDrawing.js",
	"../../../../sdkjs/word/Editor/Paragraph/ParaDrawingChanges.js",
	"../../../../sdkjs/word/Editor/Paragraph/ParagraphContentPos.js",
	"../../../../sdkjs/word/Editor/Paragraph/ComplexFieldInstruction.js",
	"../../../../sdkjs/word/Editor/Paragraph/ComplexFields/Addin.js",
	"../../../../sdkjs/word/Editor/Paragraph/ComplexFields/AddinData.js",
	"../../../../sdkjs/word/Editor/Paragraph/ComplexFields/FormText.js",
	"../../../../sdkjs/word/Editor/Paragraph/ComplexFields/MergeField.js",
	"../../../../sdkjs/word/Editor/Paragraph/ComplexField.js",
	"../../../../sdkjs/word/Editor/Paragraph/FormulaParser.js",
	"../../../../sdkjs/word/Editor/Paragraph/ParaRevisionMove.js",
	"../../../../sdkjs/word/Editor/Paragraph/GraphemesCounter.js",
	"../../../../sdkjs/word/Editor/Paragraph/TextShaper.js",
	"../../../../sdkjs/word/Editor/Hyperlink.js",
	"../../../../sdkjs/word/Editor/HyperlinkChanges.js",
	"../../../../sdkjs/word/Editor/Field.js",
	"../../../../sdkjs/word/Editor/FieldChanges.js",
	"../../../../sdkjs/word/Editor/FormFieldChanges.js",
	"../../../../sdkjs/word/Editor/Run.js",
	"../../../../sdkjs/word/Editor/PresentationField.js",
	"../../../../sdkjs/word/Editor/RunChanges.js",
	"../../../../sdkjs/word/Editor/Math.js",
	"../../../../sdkjs/word/Editor/MathChanges.js",
	"../../../../sdkjs/word/Editor/Paragraph.js",
	"../../../../sdkjs/word/Editor/ParagraphChanges.js",
	"../../../../sdkjs/word/Editor/Paragraph_Recalculate.js",
	"../../../../sdkjs/word/Editor/Sections.js",
	"../../../../sdkjs/word/Editor/SectionsChanges.js",
	"../../../../sdkjs/word/Editor/Numbering/NumberingApplicator.js",
	"../../../../sdkjs/word/Editor/Numbering/NumberingCollection.js",
	"../../../../sdkjs/word/Editor/Numbering/NumberingCommon.js",
	"../../../../sdkjs/word/Editor/Numbering/NumberingLvl.js",
	"../../../../sdkjs/word/Editor/Numbering/AbstractNum.js",
	"../../../../sdkjs/word/Editor/Numbering/AbstractNumChanges.js",
	"../../../../sdkjs/word/Editor/Numbering/Num.js",
	"../../../../sdkjs/word/Editor/Numbering/NumChanges.js",
	"../../../../sdkjs/word/Editor/Numbering/NumInfo.js",
	"../../../../sdkjs/word/Editor/Numbering/PresentationNumbering.js",
	"../../../../sdkjs/word/Editor/Numbering/Numbering.js",
	"../../../../sdkjs/word/Editor/HeaderFooter.js",
	"../../../../sdkjs/word/Editor/Layout/Base.js",
	"../../../../sdkjs/word/Editor/Layout/PrintView.js",
	"../../../../sdkjs/word/Editor/Layout/ReadView.js",
	"../../../../sdkjs/word/Editor/DocumentContentBase.js",
	"../../../../sdkjs/word/Editor/Document.js",
	"../../../../sdkjs/word/Editor/DocumentSettings.js",
	"../../../../sdkjs/word/Editor/ChangeCase.js",
	"../../../../sdkjs/word/Editor/SelectedContent.js",
	"../../../../sdkjs/word/Editor/DocumentOutline.js",
	"../../../../sdkjs/word/Editor/DocumentChanges.js",
	"../../../../sdkjs/word/Editor/DocumentContent.js",
	"../../../../sdkjs/word/Editor/DocumentContentChanges.js",
	"../../../../sdkjs/word/Editor/DocumentControllerBase.js",
	"../../../../sdkjs/word/Editor/LogicDocumentController.js",
	"../../../../sdkjs/word/Editor/DrawingsController.js",
	"../../../../sdkjs/word/Editor/HeaderFooterController.js",
	"../../../../sdkjs/word/Editor/Common.js",
	"../../../../sdkjs/word/Editor/Table.js",
	"../../../../sdkjs/word/Editor/Table/TableChanges.js",
	"../../../../sdkjs/word/Editor/Table/TableRecalculate.js",
	"../../../../sdkjs/word/Editor/Table/TableDraw.js",
	"../../../../sdkjs/word/Editor/Table/TableRow.js",
	"../../../../sdkjs/word/Editor/Table/TableRowChanges.js",
	"../../../../sdkjs/word/Editor/Table/TableCell.js",
	"../../../../sdkjs/word/Editor/Table/TableCellChanges.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/SdtBase.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/BlockLevel.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/FormKeyGenerator.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/FormsManager.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/FormToJson.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/InlineLevel.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/SdtPr.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/SdtPrChanges.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/Custom/CheckBox.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/Custom/ComboBox.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/Custom/ComplexForm.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/Custom/DatePicker.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/Custom/Form.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/Custom/PictureForm.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/Custom/TextForm.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/Custom/TextFormFormat.js",
	"../../../../sdkjs/word/Editor/StructuredDocumentTags/Custom/TextFormMask.js",
	"../../../../sdkjs/word/Editor/Serialize2.js",
	"../../../../sdkjs/common/api/searchSettings.js",
	"../../../../sdkjs/word/Editor/Search/DocumentSearch.js",
	"../../../../sdkjs/word/Editor/Search/ParagraphSearch.js",
	"../../../../sdkjs/word/Editor/Search/SearchItem.js",
	"../../../../sdkjs/word/Editor/Search/Pattern.js",
	"../../../../sdkjs/word/Editor/SpellChecker/DocumentSpellChecker.js",
	"../../../../sdkjs/word/Editor/SpellChecker/ParagraphCollector.js",
	"../../../../sdkjs/word/Editor/SpellChecker/ParagraphSpellChecker.js",
	"../../../../sdkjs/word/Editor/SpellChecker/ParagraphSpellCheckerElement.js",
	"../../../../sdkjs/word/Editor/FootEndNote.js",
	"../../../../sdkjs/word/Editor/Footnotes.js",
	"../../../../sdkjs/word/Editor/FootnotesChanges.js",
	"../../../../sdkjs/word/Editor/Endnotes.js",
	"../../../../sdkjs/word/Editor/EndnotesChanges.js",
	"../../../../sdkjs/word/Editor/GlossaryDocument.js",
	"../../../../sdkjs/word/Editor/GlossaryDocumentChanges.js",
	"../../../../sdkjs/word/Editor/DocumentProtection.js",
	"../../../../sdkjs/word/Editor/Comparison.js",
	"../../../../sdkjs/word/Editor/Revisions/TrackRevisionsManager.js",
	"../../../../sdkjs/word/Editor/Merge.js",
	"../../../../sdkjs/word/Drawing/Graphics.js",
	"../../../../sdkjs/word/Drawing/ShapeDrawer.js",
	"../../../../sdkjs/word/Drawing/buttons.js",
	"../../../../sdkjs/word/Drawing/cachemanager.js",
	"../../../../sdkjs/word/Drawing/stylespainter.js",
	"../../../../sdkjs/word/Drawing/DrawingDocument.js",
	"../../../../sdkjs/word/Drawing/GraphicsEvents.js",
	"../../../../sdkjs/word/Drawing/Rulers.js",
	"../../../../sdkjs/word/Drawing/printpreview.js",
	"../../../../sdkjs/word/Drawing/HtmlPage.js",
	"../../../../sdkjs/word/Drawing/documentrenderer.js",
	"../../../../sdkjs/pdf/src/thumbnails.js",
	"../../../../sdkjs/pdf/src/viewer.js",
	"../../../../sdkjs/pdf/src/file.js",
	"../../../../sdkjs/word/document/empty.js",
	"../../../../sdkjs/word/Math/NamesOfLiterals.js",
	"../../../../sdkjs/word/Math/LaTeXParser.js",
	"../../../../sdkjs/word/Math/UnicodeParser.js",
	"../../../../sdkjs/word/Math/mathTypes.js",
	"../../../../sdkjs/word/Math/mathText.js",
	"../../../../sdkjs/word/Math/mathContent.js",
	"../../../../sdkjs/word/Math/base.js",
	"../../../../sdkjs/word/Math/fraction.js",
	"../../../../sdkjs/word/Math/degree.js",
	"../../../../sdkjs/word/Math/matrix.js",
	"../../../../sdkjs/word/Math/limit.js",
	"../../../../sdkjs/word/Math/nary.js",
	"../../../../sdkjs/word/Math/radical.js",
	"../../../../sdkjs/word/Math/operators.js",
	"../../../../sdkjs/word/Math/accent.js",
	"../../../../sdkjs/word/Math/borderBox.js",
	"../../../../sdkjs/word/Math/mathTrackHandler.js",
	"../../../../sdkjs/word/Editor/Styles/FixedFormDefaults.js",
	"../../../../sdkjs/word/apiBuilder.js",
	"../../../../sdkjs/word/fromToJSON.js",
	"../../../../sdkjs/common/versionHistory.js",
	"../../../../sdkjs/common/clipboard_base.js",
	"../../../../sdkjs/common/text_input2.js",
	"../../../../sdkjs/common/Drawings/Format/OleObject.js",
	"../../../../sdkjs/common/Drawings/Format/DrawingContent.js",
	"../../../../sdkjs/common/plugins.js",
	"../../../../sdkjs/common/Native/native_graphics.js",
	"../../../../sdkjs/vendor/easysax.js",
	"../../../../sdkjs/common/openxml.js",
	"../../../../sdkjs-forms/apiBuilder.js",
	"../../../../sdkjs-forms/oform/OForm.js",
	"../../../../sdkjs-forms/oform/Role.js",
	"../../../../sdkjs-forms/oform/xml/XmlPackage.js",
	"../../../../sdkjs-forms/oform/xml/XmlContext.js",
	"../../../../sdkjs-forms/oform/format/BaseFormatObject.js",
	"../../../../sdkjs-forms/oform/format/Document.js",
	"../../../../sdkjs-forms/oform/format/FieldGroup.js",
	"../../../../sdkjs-forms/oform/format/FieldMaster.js",
	"../../../../sdkjs-forms/oform/format/User.js",
	"../../../../sdkjs-forms/oform/format/UserMaster.js",
	"../../../../sdkjs-forms/oform/format/changes/DictionaryBase.js",
	"../../../../sdkjs-forms/oform/format/changes/DocumentChanges.js",
	"../../../../sdkjs-forms/oform/format/changes/FieldGroupChanges.js",
	"../../../../sdkjs-forms/oform/format/changes/FieldMasterChanges.js",
	"../../../../sdkjs-forms/oform/format/changes/UserChanges.js",
	"../../../../sdkjs-forms/oform/format/changes/UserMasterChanges.js"
];