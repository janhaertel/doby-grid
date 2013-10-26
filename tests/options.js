// doby-grid.js
// (c) 2013 Evgueni Naverniouk, Globex Designs, Inc.
// Doby may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/globexdesigns/doby-grid

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50*/
/*global _, $, describe, document, expect, DobyGrid, Image, it, runs, setFixtures, waitsFor, window*/

describe("Grid Options", function () {
	"use strict";


	// ==========================================================================================


	// Utilities for resetting the grid
	var defaultData = function () {
		return JSON.parse(JSON.stringify({
			columns: [
				{id: 'id', field: 'id', name: 'id'},
				{id: 'name', field: 'name', name: 'name'}
			],
			data: [
				{data: {id: 189, name: 'test'}, id: 189},
				{data: {id: 289, name: 'test2'}, id: 289}
			]
		}));
	};

	var resetGrid = function (options) {
		options = options || {};
		var grid = new DobyGrid(options),
			fixture = setFixtures();

		// This is needed for grunt-jasmine tests which doesn't read the CSS
		// from the HTML version of jasmine.
		fixture.attr('style', 'position:absolute;top:0;left:0;opacity:0;width:500px');

		grid.appendTo(fixture);
		return grid;
	};


	// ==========================================================================================


	describe("options.activateSelection", function () {
		it("should be enabled by default", function () {
			// Prepare for test
			var grid = resetGrid(defaultData());

			expect(grid.options.activateSelection).toEqual(true);
		});


		// ==========================================================================================


		it("should set an active cell with options.activateSelection enabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				activateSelection: true,
				selectable: true
			}));

			// Find the first and last cells
			var firstcell = grid.$el.find('.doby-grid-row:first .doby-grid-cell:first'),
				lastcell = grid.$el.find('.doby-grid-row:last .doby-grid-cell:first');

			// Get the drag delta from the first cell
			var a = grid.$el.find('.doby-grid-cell:first');
			var dy = firstcell.position().top - lastcell.position().top + lastcell.height();

			// Simulate a click and drag on the cell ranges
			firstcell.simulate('drag', {dx: 0, dy: dy});

			// Expect the first and last cells to be selected
			expect(grid.selection.length).toBeGreaterThan(0);
			expect(grid.selection[0].fromCell).toEqual(0);
			expect(grid.selection[0].fromRow).toEqual(0);
			expect(grid.selection[0].toCell).toEqual(0);
			expect(grid.selection[0].toRow).toEqual(1);

			// Expect active cell to be selected
			expect(grid.active.row).toEqual(1);
			expect(grid.active.cell).toEqual(0);
		});


		// ==========================================================================================


		it("should not set an active cell with options.activateSelection disabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				activateSelection: false
			}));

			// Find the first and last cells
			var firstcell = grid.$el.find('.doby-grid-row:first .doby-grid-cell:first'),
				lastcell = grid.$el.find('.doby-grid-row:last .doby-grid-cell:first');

			// Get the drag delta from the first cell
			var dy = lastcell.position().top - lastcell.position().top + lastcell.height();

			// Simulate a click and drag on the cell ranges
			firstcell.simulate('drag', {dx: 0, dy: dy});

			// Expect the first and last cells to be selected
			expect(grid.selection.length).toBeGreaterThan(0);
			expect(grid.selection[0].fromCell).toEqual(0);
			expect(grid.selection[0].fromRow).toEqual(0);
			expect(grid.selection[0].toCell).toEqual(0);
			expect(grid.selection[0].toRow).toEqual(1);

			// Expect no active cell be selected
			expect(grid.active).toEqual(null);
		});
	});


	// ==========================================================================================


	describe("options.addRow", function () {
		it("should be disabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.addRow).toEqual(false);
		});


		// ==========================================================================================


		it("should render a special row at the end of the grid when using options.addRow", function () {
			// Prepare data for test
			var grid = resetGrid($.extend(defaultData(), {
				addRow: true,
				data: [{data: {id: 1, name: "one"}, id: 1}, {data: {id: 2, name: "two", category: "asd"}, id: 2}],
				editable: true
			}));

			grid.$el.find('.doby-grid-row:last-child .doby-grid-cell').each(function () {
				expect(this).toBeEmpty();
			});

			// Disable to prevent conflict with other tests
			grid.setOptions({addRow: false, editable: false});

			// Make sure row is removed
			grid.$el.find('.doby-grid-row:last-child .doby-grid-cell').each(function () {
				expect(this).not.toBeEmpty();
			});
		});
	});


	// ==========================================================================================


	describe("options.asyncEditorLoadDelay and options.asyncEditorLoading", function () {
		it("options.asyncEditorLoadDelay should be 100 by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.asyncEditorLoadDelay).toEqual(100);
		});


		// ==========================================================================================


		it("options.asyncEditorLoading should be false by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.asyncEditorLoading).toEqual(false);
		});


		// ==========================================================================================


		it("should draw a cell editor immediately if options.asyncEditorLoading is disabled", function () {
			// Prepare data for test
			var grid = resetGrid($.extend(defaultData(), {
				asyncEditorLoading: false,
				editable: true
			}));

			// Find the first cell
			var firstCell = grid.$el.find('.doby-grid-cell:first').first(),
				originalValue = firstCell.html();

			// Double-click a cell to enable editor
			firstCell.simulate('dblclick');

			// Nothing should happen immediately
			expect(firstCell.find('input').length).toEqual(1);
		});


		// ==========================================================================================


		it("should correctly delay the editor loading", function () {
			var delay = 500;

			// Prepare data for test
			var grid = resetGrid($.extend(defaultData(), {
				asyncEditorLoading: true,
				asyncEditorLoadDelay: delay,
				editable: true
			}));

			// Find the first cell
			var firstCell = grid.$el.find('.doby-grid-cell:first').first(),
				originalValue = firstCell.html();

			// Double-click a cell to enable editor
			firstCell.simulate('dblclick');

			// Nothing should happen immediately
			expect(firstCell.html()).toEqual(originalValue);

			waitsFor(function () {
				return firstCell.find('input').length;
			}, "Cell editor was never generated.", delay);

			runs(function () {
				expect(firstCell.find('input').length).toEqual(1);
			});
		});
	});


	// ==========================================================================================


	describe("options.asyncPostRenderDelay", function () {
		it("should be 25 by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.asyncPostRenderDelay).toEqual(25);
		});


		// ==========================================================================================


		it("options.asyncPostRenderDelay should correctly affect the delay of postprocess", function () {
			var delay = 500;

			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				asyncPostRenderDelay: delay,
				columns: [
					{
						id: 'postprocess',
						name: 'postprocess',
						postprocess: function(data, callback) {
							var img = new Image();
							data.cell.html(img);
							callback();
						}
					}
				]
			}));

			// Expect cells to be empty at first
			var cells = grid.$el.find('.doby-grid-cell');
			_.each(cells, function (cell) {
				expect($(cell).html()).toEqual('');
			});

			// But expect an image to be there after the delay
			waitsFor(function () {
				return cells.last().find('img').length;
			}, "Postprocessor never generated an image", (delay * cells.length));

			runs(function () {
				// Expect cells to have an image
				var cells = grid.$el.find('.doby-grid-cell');
				_.each(cells, function (cell) {
					expect($(cell).find('img').length).toEqual(1);
				});
			});
		});
	});


	// ==========================================================================================


	describe("options.autoColumnWidth", function () {
		it("should be disabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.autoColumnWidth).toEqual(false);
		});


		// ==========================================================================================


		it("should correctly have columns fill up the width of viewport when enabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				autoColumnWidth: true
			}));

			// Get column elements
			var headerEls = grid.$el.find('.doby-grid-header-column'),
				cellEls = grid.$el.find('.doby-grid-row:first .doby-grid-cell'),
				canvas = grid.$el.find('.doby-grid-canvas');

			var columnsW = [],
				headerW = [],
				cellsW = [],
				canvasW = canvas.width();

			// Collect widths
			_.each(grid.options.columns, function (c) { columnsW.push(c.width); });
			headerEls.each(function () { headerW.push($(this).outerWidth()); });
			cellEls.each(function () { cellsW.push($(this).outerWidth()); });

			// Calculate sums
			columnsW = columnsW.reduce(function (a, b) { return a + b; });
			headerW = headerW.reduce(function (a, b) { return a + b; });
			cellsW = cellsW.reduce(function (a, b) { return a + b; });

			// Account for cell spacing
			headerW += grid.options.columns.length;
			columnsW += grid.options.columns.length;
			cellsW -= grid.options.columns.length;

			// Expect widths to be correct for headers and cells
			expect(columnsW).toEqual(canvasW);
			expect(headerW).toEqual(canvasW);
			expect(cellsW).toEqual(canvasW);
		});
	});


	// ==========================================================================================


	describe("options.autoDestroy", function () {
		it("should be enabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.autoDestroy).toEqual(true);
		});


		// ==========================================================================================


		it("should correctly call destroy() when enabled", function () {
			// Prepare for test
			var grid = resetGrid(defaultData());

			// Main element should exist
			expect(grid.$el).toBeDefined();

			// Remove parent
			grid.$el.parent().remove();

			// Main element should not exist
			expect(grid.$el).toEqual(null);
		});


		// ==========================================================================================


		it("should not call destroy() when disabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {autoDestroy: false}));

			// Main element should exist
			expect(grid.$el).toBeDefined();

			// Remove parent
			grid.$el.parent().remove();

			// Main element should not exist
			expect(grid.$el).not.toEqual(null);
		});
	});


	// ==========================================================================================


	describe("options.autoEdit", function () {
		it("should be enabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.autoEdit).toEqual(true);
		});


		// ==========================================================================================


		it("should create an editor on single click when autoEdit is enabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {editable: true}));

			// Find the first cell
			var firstCell = grid.$el.find('.doby-grid-cell:first').first(),
				originalValue = firstCell.html();

			// Double-click a cell to enable editor
			firstCell.simulate('click');

			// Nothing should happen immediately
			expect(firstCell.find('input').length).toEqual(1);
		});
	});


	// ==========================================================================================


	describe("options.class", function () {
		it("should correctly apply classes to the grid element", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {class: 'one two three'}));

			expect(grid.$el.hasClass('one')).toEqual(true);
			expect(grid.$el.hasClass('two')).toEqual(true);
			expect(grid.$el.hasClass('three')).toEqual(true);
		});
	});


	// ==========================================================================================


	describe("options.clipboard", function () {
		it("should be able to convert selected data to CSV and JSON", function () {
			// Prepare for test
			var grid = resetGrid(defaultData());

			// Select some cells
			grid.selectCells(0, 0, 1, 1);

			// Convert selection to JSON
			var jaysun = grid.selection[0].toJSON();
			expect(jaysun).toEqual([[189, 'test'], [289, 'test2']]);

			// Convert selection to CSV
			var csv = grid.selection[0].toCSV();
			expect(csv).toEqual('"189","test"\n"289","test2"');
		});


		// ==========================================================================================


		it("should save data to user's clipboard on Ctrl + C", function () {
			// Prepare for test
			var grid = resetGrid(defaultData());

			// Select some cells
			grid.selectCells(0, 0, 1, 1);

			// Make sure we're focused on the canvas
			grid.$el.find('.doby-grid-canvas').focus();

			// Simulate Ctrl + C
			var press = $.Event('keydown');
			press.ctrlKey = true;
			press.which = 67;
			$(document.activeElement).trigger(press);

			// Since we don't have access the actual clipboard, the
			// best we can do here is check to make sure the clipboard element was created and focused
			var clippy = grid.$el.find('.doby-grid-clipboard');
			expect(clippy).toBeDefined();
			expect(clippy.length).toEqual(1);
			expect(clippy[0]).toEqual(document.activeElement);
		});
	});


	// ==========================================================================================


	describe("options.columns", function () {
		it("should set the columns based given values", function () {
			var cols = [{
				id: 'one',
				name: 'One'
			}, {
				id: 'two',
				name: 'Two'
			}];

			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				columns: cols
			}));

			// Ensure correct name is set
			grid.$el.find('.doby-grid-column-name').each(function(i) {
				expect($(this).text()).toEqual(cols[i].name);
			});
		});
	});


	// ==========================================================================================


	describe("options.columnWidth", function () {
		it("should be 80 by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.columnWidth).toEqual(80);
		});


		// ==========================================================================================


		it("should be correct affect default column width but not affect defined column widths", function () {
			var cols = [{
				id: 'one',
				name: 'One'
			}, {
				id: 'two',
				name: 'Two',
				width: 250
			}];

			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				autoColumnWidth: false,
				columns: cols,
				columnWidth: 100,
				forceFitColumns: false
			}));

			// Ensure correct values are set for headers
			grid.$el.find('.doby-grid-header-column').each(function(i) {
				if (i === 0) {
					expect(grid.options.columns[i].width).toEqual(100);
					expect($(this).outerWidth()).toEqual(100);
				} else if (i === 1) {
					expect(grid.options.columns[i].width).toEqual(250);
					expect($(this).outerWidth()).toEqual(250);
				}
			});

			// Ensure correct values are set for cells
			var w;
			grid.$el.find('.doby-grid-row').each(function() {
				$(this).children('.doby-grid-cell').each(function(i) {
					w = $(this).outerWidth() - parseInt($(this).css('borderLeftWidth'), 10) - parseInt($(this).css('borderRightWidth'), 10);

					if (i === 0) {
						expect(w).toEqual(100);
					} else if (i === 1) {
						expect(w).toEqual(250);
					}
				});
			});
		});
	});


	// ==========================================================================================


	describe("options.dataExtractor", function () {
		it("should correct affect all places where data values are pulled", function () {
			var value = "TEST-123";

			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				dataExtractor: function (item, columnDef) {
					return value;
				}
			}));

			// Make sure all cells are using the right value
			grid.$el.find('.doby-grid-cell').each(function () {
				expect($(this).text()).toEqual(value);
			});

			// Group rows and make sure headers have the right value
			grid.addGrouping(grid.options.columns[0].id);
			grid.$el.find('.doby-grid-group-title').each(function () {
				expect($(this).text()).toContain(value);
			});
		});
	});


	// ==========================================================================================


	describe("options.editable", function () {
		it("should be disabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.editable).toEqual(false);
		});


		// ==========================================================================================


		it("should not create an editor on double click when disabled", function () {
			// Prepare for test
			var grid = resetGrid(defaultData());

			// Find the first cell
			var firstCell = grid.$el.find('.doby-grid-cell:first').first(),
				originalValue = firstCell.html();

			// Double-click a cell to enable editor
			firstCell.simulate('dblclick');

			// Nothing should happen immediately
			expect(firstCell.find('input').length).toEqual(0);
		});


		// ==========================================================================================


		it("should create an editor on double click when enabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {editable: true}));

			// Find the first cell
			var firstCell = grid.$el.find('.doby-grid-cell:first').first(),
				originalValue = firstCell.html();

			// Double-click a cell to enable editor
			firstCell.simulate('dblclick');

			// Nothing should happen immediately
			expect(firstCell.find('input').length).toEqual(1);
		});
	});


	// ==========================================================================================


	describe("options.emptyNotice", function () {
		it("should be enabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.emptyNotice).toEqual(true);
		});


		// ==========================================================================================


		it("should render an empty notice when there is no data", function () {
			// Ensure empty notice is on
			var grid = resetGrid({emptyNotice: true});

			// Empty the grid
			grid.reset();

			// Check to see if alert was rendered
			expect(grid.$el).toContain('.doby-grid-alert');
		});
	});


	// ==========================================================================================


	describe("options.formatter", function () {
		it("should correctly formater the cell values", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				formatter: function (row, cell, value, columnDef, data) {
					return [row, cell, value].join('-');
				}
			}));

			// Make sure cells have the right values
			var value;
			grid.$el.find('.doby-grid-row').each(function(row) {
				$(this).find('.doby-grid-cell').each(function(cell) {
					value = grid.options.data[row].data[grid.options.columns[cell].id];
					expect($(this).text()).toEqual([row, cell, value].join('-'));
				});
			});
		});
	});


	// ==========================================================================================


	describe("options.fullWidthRows", function () {
		it("should be enabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.fullWidthRows).toEqual(true);
		});


		// ==========================================================================================


		it("should be correctly extend the rows to the full width", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {fullWidthRows: true}));
			var viewport = grid.$el.find('.doby-grid-viewport:first').first(),
				viewportW = viewport.width() - window.scrollbarDimensions.width;

			grid.$el.find('.doby-grid-row').each(function () {
				expect($(this).width()).toEqual(viewportW);
			});
		});


		// ==========================================================================================


		it("should be correctly set the width to the cell widths when disabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {fullWidthRows: false})),
				cellWidths = (grid.options.columns.length * grid.options.columnWidth) + 2;

			grid.$el.find('.doby-grid-row').each(function () {
				expect($(this).width()).toEqual(cellWidths);
			});
		});
	});


	// ==========================================================================================


	describe("options.groupable", function () {
		it("should be enabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.groupable).toEqual(true);
		});


		// ==========================================================================================


		it("should throw an exception if attempting to use grouping functions with options.groupable disabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {groupable: false}));

			expect(function () {
				grid.addGrouping(grid.options.columns[0].id);
			}).toThrow('Cannot execute "addGrouping" because "options.groupable: is disabled.');

			expect(function () {
				grid.setGrouping(grid.options.columns[0].id);
			}).toThrow('Cannot execute "setGrouping" because "options.groupable: is disabled.');
		});
	});


	// ==========================================================================================


	describe("options.headerMenu", function () {
		it("should be enabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.headerMenu).toEqual(true);
		});


		// ==========================================================================================


		it("should display a dropdown menu on header right-click", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {headerMenu: true}));

			// Right-click on every columns and make sure the menu comes up
			grid.$el.find('.doby-grid-header-column').each(function (i) {
				$(this).simulate('contextmenu');

				// jquery.simulate doesn't actually propagate click events up the DOM
				// so dropdowns will accumulate. But that's okey for this test.
				expect(grid.$el.find('.doby-grid-dropdown').length).toEqual(i + 1);
			});
		});


		// ==========================================================================================


		it("should not display a dropdown menu header right-click if disabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {headerMenu: false}));

			// Right-click on every columns and make sure the menu comes up
			grid.$el.find('.doby-grid-header-column').each(function (i) {
				$(this).simulate('contextmenu');

				// Should be no dropdowns
				expect(grid.$el.find('.doby-grid-dropdown').length).toEqual(0);
			});
		});
	});


	// ==========================================================================================


	describe("options.keyboardNavigation", function () {
		it("should be enabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.keyboardNavigation).toEqual(true);
		});


		// ==========================================================================================


		it("should activate cell on the right on 'right' click", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {keyboardNavigation: true}));

			// Activate the first cell
			grid.activate(0, 0);

			// Go right
			grid.$el.find('.doby-grid-canvas').simulate('keydown', {keyCode: 39});

			expect(grid.active).toBeDefined();
			expect(grid.active.row).toEqual(0);
			expect(grid.active.cell).toEqual(1);
		});


		// ==========================================================================================


		it("should activate cell on the left on 'left' click", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {keyboardNavigation: true}));

			// Activate the first cell
			grid.activate(0, 1);

			// Go right
			grid.$el.find('.doby-grid-canvas').simulate('keydown', {keyCode: 37});

			expect(grid.active).toBeDefined();
			expect(grid.active.row).toEqual(0);
			expect(grid.active.cell).toEqual(0);
		});


		// ==========================================================================================


		it("should activate cell on the bottom on 'down' click", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {keyboardNavigation: true}));

			// Activate the first cell
			grid.activate(0, 0);

			// Go right
			grid.$el.find('.doby-grid-canvas').simulate('keydown', {keyCode: 40});

			expect(grid.active).toBeDefined();
			expect(grid.active.row).toEqual(1);
			expect(grid.active.cell).toEqual(0);
		});


		// ==========================================================================================


		it("should activate cell on the top on 'up' click", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {keyboardNavigation: true}));

			// Activate the first cell
			grid.activate(1, 0);

			// Go right
			grid.$el.find('.doby-grid-canvas').simulate('keydown', {keyCode: 38});

			expect(grid.active).toBeDefined();
			expect(grid.active.row).toEqual(0);
			expect(grid.active.cell).toEqual(0);
		});


		// ==========================================================================================


		it("should activate cell on the right on 'tab' click", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {keyboardNavigation: true}));

			// Activate the first cell
			grid.activate(0, 0);

			// Go right
			grid.$el.find('.doby-grid-canvas').simulate('keydown', {keyCode: 9});

			expect(grid.active).toBeDefined();
			expect(grid.active.row).toEqual(0);
			expect(grid.active.cell).toEqual(1);
		});


		// ==========================================================================================


		it("should activate cell on the left on 'shift + tab' click", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {keyboardNavigation: true}));

			// Activate the first cell
			grid.activate(0, 1);

			// Go right
			grid.$el.find('.doby-grid-canvas').simulate('keydown', {shiftKey: true, keyCode: 9});

			expect(grid.active).toBeDefined();
			expect(grid.active.row).toEqual(0);
			expect(grid.active.cell).toEqual(0);
		});
	});


	// ==========================================================================================


	describe("options.locale", function () {
		it("should be defined", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.locale).toBeDefined();
		});
	});


	// ==========================================================================================


	describe("options.multiColumnSort", function () {
		it("should be enabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.multiColumnSort).toEqual(true);
		});


		// ==========================================================================================


		it("should allow multi column selection via setSorting() when enabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {multiColumnSort: true}));

			var sort = [];
			_.each(grid.options.columns, function (col) {
				sort.push({
					columnId: col.id,
					sortAsc: true
				});
			});

			// Make sure we have multiple sort items
			expect(sort.length).toBeGreaterThan(1);

			// Apply sort
			grid.setSorting(sort);

			// Check sorting
			expect(grid.sorting).toEqual(sort);
		});


		// ==========================================================================================


		it("should not allow multi column selection via setSorting() when disabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {multiColumnSort: false}));

			var sort = [];
			_.each(grid.options.columns, function (col) {
				sort.push({
					columnId: col.id,
					sortAsc: true
				});
			});

			// Make sure we have multiple sort items
			expect(sort.length).toBeGreaterThan(1);

			// Apply sort
			expect(function () {
				grid.setSorting(sort);
			}).toThrow('Doby Grid cannot set the sorting given because "multiColumnSort" is disabled and the given sorting options contain multiple columns.');

			// Make sure sort isn't set
			expect(grid.sorting).not.toEqual(sort);
		});
	});


	// ==========================================================================================


	describe("options.resizableColumns", function () {
		it("should be enabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.resizableColumns).toEqual(true);
		});


		// ==========================================================================================


		it("should draw resize handles for every column when enabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {resizableColumns: true}));

			// Check to make sure all columns have handles
			grid.$el.find('.doby-grid-header-column').each(function () {
				expect($(this).children('.doby-grid-resizable-handle').length).toEqual(1);
			});
		});


		// ==========================================================================================


		it("should draw resize handles for every column (execept the last) when enabled with options.autoColumnWidth enabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				autoColumnWidth: true,
				resizableColumns: true
			}));

			// Check to make sure all columns have handles
			grid.$el.find('.doby-grid-header-column').each(function (i) {
				if (i < grid.options.columns.length - 1) {
					expect($(this).children('.doby-grid-resizable-handle').length).toEqual(1);
				} else {
					expect($(this).children('.doby-grid-resizable-handle').length).toEqual(0);
				}
			});
		});


		// ==========================================================================================


		it("should not draw resize handles when disabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				resizableColumns: false
			}));

			// Check to make sure all columns have handles
			grid.$el.find('.doby-grid-header-column').each(function (i) {
				expect($(this).children('.doby-grid-resizable-handle').length).toEqual(0);
			});
		});


		// ==========================================================================================


		it("should not draw resize handles on columns which have resizing disabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				columns: [
					{id: 'id', field: 'id'},
					{id: 'id2', resizable: false, field: 'id2'},
					{id: 'id3', field: 'id3'},
					{id: 'id4', resizable: false, field: 'id4'}
				],
				resizableColumns: true
			}));

			// Check to make sure all the right columns have handles
			grid.$el.find('.doby-grid-header-column').each(function (i) {
				if (i % 2) {
					expect($(this).children('.doby-grid-resizable-handle').length).toEqual(0);
				} else{
					expect($(this).children('.doby-grid-resizable-handle').length).toEqual(1);
				}
			});
		});
	});


	// ==========================================================================================


	describe("options.resizableRows", function () {
		it("should be disabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.resizableRows).toEqual(false);
		});


		// ==========================================================================================


		it("should draw resize handles for every row when enabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {resizableRows: true}));

			// Check to make sure all columns have handles
			grid.$el.find('.doby-grid-row').each(function (i) {
				expect($(this).children('.doby-grid-row-handle').length).toEqual(1);
			});
		});


		// ==========================================================================================


		it("should not draw resize handles when disabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {resizableRows: false}));

			// Check to make sure all columns have handles
			grid.$el.find('.doby-grid-row').each(function (i) {
				expect($(this).children('.doby-grid-row-handle').length).toEqual(0);
			});
		});


		// ==========================================================================================


		it("should not draw resize handles when specific rows override the default setting", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				data: [
					{data: {id: 189, name: 'test'}, id: 189},
					{data: {id: 289, name: 'test2'}, id: 289, resizable: false},
					{data: {id: 389, name: 'test3'}, id: 389},
					{data: {id: 489, name: 'test4'}, id: 489, resizable: false}
				],
				resizableRows: true
			}));


			// Check to make sure all columns have handles
			grid.$el.find('.doby-grid-row').each(function (i) {
				if (i % 2) {
					expect($(this).children('.doby-grid-row-handle').length).toEqual(0);
				} else{
					expect($(this).children('.doby-grid-row-handle').length).toEqual(1);
				}
			});
		});
	});


	// ==========================================================================================


	describe("options.resizeCells", function () {
		it("should be disabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.resizeCells).toEqual(false);
		});


		// ==========================================================================================


		it("should only resize headers during drag when disabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				autoColumnWidth: false,
				resizableColumns: true,
				resizeCells: false
			}));

			// Find columns and their cells
			var columnData = [];
			grid.$el.find('.doby-grid-header-column').each(function() {
				columnData.push({
					header: $(this),
					cells: []
				});
			});
			grid.$el.find('.doby-grid-row').each(function () {
				$(this).find('.doby-grid-cell').each(function (i) {
					columnData[i].cells.push($(this));
				});
			});

			// How much should we drag
			var drag_distance = 100;

			// Simulate a drag
			var handle, widths_before, widths_during, widths_after;
			_.each(columnData, function(cd) {
				// Grab the handle
				handle = cd.header.find('.doby-grid-resizable-handle');

				// Calculate widths before drag
				widths_before = [cd.header.width()];
				_.each(cd.cells, function(cell, i) {
					widths_before.push(cell.width());
				});

				// Start dragging
				handle.trigger({type: 'dragstart', pageX: 0});
				handle.trigger({type: 'drag', pageX: drag_distance});

				// Calculate widths during drag
				widths_during = [cd.header.width()];
				_.each(cd.cells, function(cell, i) {
					widths_during.push(cell.width());
				});

				// Stop dragging
				handle.trigger('dragend');

				// Calculate widths after drag
				widths_after = [cd.header.width()];
				_.each(cd.cells, function(cell, i) {
					widths_after.push(cell.width());
				});

				// Expect headers to drag
				expect(widths_during[0]).toEqual(widths_before[0] + drag_distance);
				expect(widths_after[0]).toEqual(widths_before[0] + drag_distance);

				// Expect cells to stand still
				for (var i = 1, l = widths_during; i < l; i++) {
					expect(widths_during[i]).toEqual(widths_before[i]);
					expect(widths_after[i]).toEqual(widths_before[i] + drag_distance);
				}
			});
		});


		// ==========================================================================================


		it("should resize headers and cells during drag when enabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				autoColumnWidth: false,
				resizableColumns: true,
				resizeCells: true
			}));

			// Find columns and their cells
			var columnData = [];
			grid.$el.find('.doby-grid-header-column').each(function() {
				columnData.push({
					header: $(this),
					cells: []
				});
			});
			grid.$el.find('.doby-grid-row').each(function () {
				$(this).find('.doby-grid-cell').each(function (i) {
					columnData[i].cells.push($(this));
				});
			});

			// How much should we drag
			var drag_distance = 100;

			// Simulate a drag
			var handle, widths_before, widths_during, widths_after;
			_.each(columnData, function(cd) {
				// Grab the handle
				handle = cd.header.find('.doby-grid-resizable-handle');

				// Calculate widths before drag
				widths_before = [cd.header.width()];
				_.each(cd.cells, function(cell, i) {
					widths_before.push(cell.width());
				});

				// Start dragging
				handle.trigger({type: 'dragstart', pageX: 0});
				handle.trigger({type: 'drag', pageX: drag_distance});

				// Calculate widths during drag
				widths_during = [cd.header.width()];
				_.each(cd.cells, function(cell, i) {
					widths_during.push(cell.width());
				});

				// Stop dragging
				handle.trigger('dragend');

				// Calculate widths after drag
				widths_after = [cd.header.width()];
				_.each(cd.cells, function(cell, i) {
					widths_after.push(cell.width());
				});

				// Expect headers to drag
				expect(widths_during[0]).toEqual(widths_before[0] + drag_distance);
				expect(widths_after[0]).toEqual(widths_before[0] + drag_distance);

				// Expect cells to stand still
				for (var i = 1, l = widths_during; i < l; i++) {
					expect(widths_during[i]).toEqual(widths_before[i] + drag_distance);
					expect(widths_after[i]).toEqual(widths_before[i] + drag_distance);
				}
			});
		});
	});


	// ==========================================================================================


	describe("options.reorderable", function () {
		it("should be enabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.reorderable).toEqual(true);
		});


		// ==========================================================================================


		it("should correctly re-arrange columns via drag and drop when enabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				columns: [
					{id: 'id', field: 'id', name: 'id', class: 'one'},
					{id: 'name', field: 'name', name: 'name', class: 'two'}
				]
			}));

			// Capture the order before the move
			var orderBefore = JSON.parse(JSON.stringify(grid.options.columns));

			// Grab the columns
			var cols = grid.$el.find('.doby-grid-header-column');

			// Programmatically move the column 0 after column 1
			cols.eq(0).simulate('drag', {dx: cols.eq(0).width() * 2});

			// Grab the columns again
			var colsAfter = grid.$el.find('.doby-grid-header-column');

			// Confirm that the elements moved correctly
			expect(cols[0].id).toEqual(colsAfter[1].id);
			expect(cols[1].id).toEqual(colsAfter[0].id);

			// Confirm that classes are changed (ie. rows re-rendered)
			grid.$el.find('.doby-grid-row').each(function () {
				$(this).find('.doby-grid-cell').each(function (i) {
					if (i === 0) {
						expect($(this).hasClass('two')).toEqual(true);
					} else {
						expect($(this).hasClass('one')).toEqual(true);
					}
				});
			});

			// Confirm that column options got reversed
			expect(orderBefore).toEqual(grid.options.columns.reverse());
		});
	});


	// ==========================================================================================


	describe("options.rowHeight", function () {
		it("should be 28 by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.rowHeight).toEqual(28);
		});


		// ==========================================================================================


		it("should correctly affect the height of rows in the grid", function () {
			var testheight = 100;

			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {rowHeight: testheight}));

			// Make sure we've got actual rows to test on
			expect(grid.$el.find('.doby-grid-row').length).toBeGreaterThan(0);

			grid.$el.find('.doby-grid-row').each(function () {
				// Make sure row is the correct height
				expect($(this).height()).toEqual(testheight);

				// Make sure every cell is the correct height
				$(this).find('.doby-grid-cell').each(function () {
					expect($(this).height()).toEqual(testheight);
				});
			});
		});
	});


	// ==========================================================================================


	describe("options.selectable", function () {
		it("should be enabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.selectable).toEqual(true);
		});


		// ==========================================================================================


		it("should allow cell range selection when enabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				selectable: true
			}));

			// Find the first and last cells
			var firstcell = grid.$el.find('.doby-grid-row:first .doby-grid-cell:first'),
				lastcell = grid.$el.find('.doby-grid-row:last .doby-grid-cell:first');

			// Get the drag delta from the first cell
			var a = grid.$el.find('.doby-grid-cell:first');
			var dy = firstcell.position().top - lastcell.position().top + lastcell.height();

			// Simulate a click and drag on the cell ranges
			firstcell.simulate('drag', {dx: 0, dy: dy});

			// Expect the first and last cells to be selected
			expect(grid.selection.length).toBeGreaterThan(0);
			expect(grid.selection[0].fromCell).toEqual(0);
			expect(grid.selection[0].fromRow).toEqual(0);
			expect(grid.selection[0].toCell).toEqual(0);
			expect(grid.selection[0].toRow).toEqual(1);
		});


		// ==========================================================================================


		it("should not allow cell range selection when disabled", function () {
			// Prepare for test
			var grid = resetGrid($.extend(defaultData(), {
				selectable: false
			}));

			// Find the first and last cells
			var firstcell = grid.$el.find('.doby-grid-row:first .doby-grid-cell:first'),
				lastcell = grid.$el.find('.doby-grid-row:last .doby-grid-cell:first');

			// Get the drag delta from the first cell
			var a = grid.$el.find('.doby-grid-cell:first');
			var dy = firstcell.position().top - lastcell.position().top + lastcell.height();

			// Simulate a click and drag on the cell ranges
			firstcell.simulate('drag', {dx: 0, dy: dy});

			// Expect the first and last cells to be selected
			expect(grid.selection).toEqual(null);
		});
	});


	// ==========================================================================================


	describe("options.selectedClass", function () {
		it("should be 'selected' by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.selectedClass).toEqual('selected');
		});


		// ==========================================================================================


		it("should apply the given class to all selected cells", function () {
			var cls = 'testing123';
			var grid = resetGrid($.extend(defaultData(), {selectedClass: cls}));

			// Get the number of columns and rows we have
			var cols = grid.options.columns.length,
				rows = grid.options.data.length;

			// Select everything
			grid.selectCells(0, 0, rows - 1, cols - 1);

			// Make sure the right class was applied to all cells
			grid.$el.find('.doby-grid-cell').each(function () {
				expect($(this).hasClass(cls)).toEqual(true);
			});
		});
	});


	// ==========================================================================================


	describe("options.shiftSelect", function () {
		it("should be enabled by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.shiftSelect).toEqual(true);
		});


		// ==========================================================================================


		it("should allow shift selection when enabled", function () {
			var grid = resetGrid($.extend(defaultData(), {shiftSelect: true}));

			// Get the number of columns and rows we have
			var cols = grid.options.columns.length,
				rows = grid.options.data.length;

			// Activate the first cell
			grid.activate(0, 0);

			// Shift-click on the last cell
			grid.$el.find('.doby-grid-cell').last().simulate("click", {shiftKey: true});

			// Expect all cells to be selected
			expect(grid.selection.length).toBeGreaterThan(0);
			expect(grid.selection[0].fromCell).toEqual(0);
			expect(grid.selection[0].fromRow).toEqual(0);
			expect(grid.selection[0].toCell).toEqual(cols - 1);
			expect(grid.selection[0].toRow).toEqual(rows - 1);
		});


		// ==========================================================================================


		it("should not allow shift selection when disabled", function () {
			var grid = resetGrid($.extend(defaultData(), {shiftSelect: false}));

			// Get the number of columns and rows we have
			var cols = grid.options.columns.length,
				rows = grid.options.data.length;

			// Activate the first cell
			grid.activate(0, 0);

			// Shift-click on the last cell
			grid.$el.find('.doby-grid-cell').last().simulate("click", {shiftKey: true});

			// Expect all cells to be selected
			expect(grid.selection).toEqual(null);
		});
	});


	// ==========================================================================================


	describe("options.tooltipType", function () {
		it("should be 'popup' by default", function () {
			var grid = resetGrid(defaultData());
			expect(grid.options.tooltipType).toEqual('popup');
		});


		// ==========================================================================================


		it("should correctly add 'title' tags if using 'title' tooltips", function () {
			var columns = [
				{id: 'zero', tooltip: 0, name: "Zero"},
				{id: 'one', tooltip: 1, name: "One"}
			];
			var grid = resetGrid($.extend(defaultData(), {
				columns: columns,
				tooltipType: 'title'
			}));

			var $columns = grid.$el.find('.doby-grid-header-column');
			_.each(columns, function (col, i) {
				expect($($columns[i]).attr('title')).toEqual(i.toString());
			});

		});


		// ==========================================================================================


		it("should throw an error if specifying an invalid type", function () {
			_.each(['a', 1, [], {}, true, false, -1], function (test) {
				expect(function () {
					resetGrid($.extend(defaultData(), {tooltipType: test}));
				}).toThrow('The "tooltipType" option be either "title" or "popup", not "' + test + '".');
			});
		});
	});

});