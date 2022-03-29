$(document).ready(function () {
  $('.loader').fadeOut(400);
  if (localStorage.content != '') {
    $('#validation-table').html(localStorage.content);
    removeRow();
    pushPtag();
    pushLot();
  }
  // $('#supplier_name').val(localStorage.supplier);

  countRows();

  //check if input is empty
  $('.add-form').on('change keyup', '.search-input', function (e) {
    let Disabled = true;
    $('.search-input').each(function () {
      let value = this.value;
      if (value && value.trim() != '') {
        Disabled = false;
      } else {
        Disabled = true;
        return false;
      }
    });

    if (Disabled) {
      $('.btn-outlined').prop('disabled', true);
    } else {
      $('.btn-outlined').prop('disabled', false);
    }
  });
});

//Sending PR via email
$('#send').on('click', function (e) {
  var fileCount = $('#fileCount').val();
  if (fileCount != 0) {
    $('#sendingFilesText').html(
      '<i class="text-success">Sending<span class="dot_one">.</span><span class="dot_two">.</span><span class="dot_three">.</span></i>'
    );
    var options_add = {
      url: 'marlon_emailPdf.php',
      success: function () {
        $('#sendingFilesText').html('<i class="text-success">Done!</i>');
        setTimeout(function () {
          location.reload();
        }, 3000);
      },
    };
    $('#emailForm').ajaxForm(options_add);
  } else {
    $('#sendingFilesText').html('<i class="text-danger">No Files</i>');
    e.preventDefault();
    setTimeout(function () {
      location.reload();
    }, 1000 * 60 * 60);
  }
});

//enter/filter item tags
$('.btn-outlined').on('click', function (e) {
  e.preventDefault();
  $('.search-input').prop('readonly', true);
  $('.loader').show();

  $(this).html('<div class="spinner-border" role="status"></div>');
  var itemTagsValue = $('#itemTags').val();
  var $tds = $('#validation-table tr > td').filter(function () {
    return $.trim($(this).text()) == itemTagsValue;
  });

  if (
    $tds.length != 0 ||
    ptag_array.includes(itemTagsValue) ||
    lotNumber_array.includes(itemTagsValue)
  ) {
    $('.loader').fadeOut(300);
    Swal.fire({
      title: itemTagsValue + ' IS ALREADY EXIST',
      icon: 'error',
      confirmButtonColor: '#4a69bd',
      confirmButtonText: 'OK',
    });
    $('.btn-outlined').html('ADD');
    $('.search-input').val('');
    $('.search-input').prop('readonly', false);
  } else {
    checkInput();
  }

  $('.btn-outlined').prop('disabled', true);
});

//finish
var finished_items = $('input[name="finished_items[]"]')
  .map(function () {
    return this.value;
  })
  .get();

var item_supplier = $('input[name="item_supplier[]"]')
  .map(function () {
    return this.value;
  })
  .get();

var item_name = $('input[name="item_name[]"]')
  .map(function () {
    return this.value;
  })
  .get();

var item_poNumber = $('input[name="item_poNumber[]"]')
  .map(function () {
    return this.value;
  })
  .get();

var item_desc = $('input[name="item_desc[]"]')
  .map(function () {
    return this.value;
  })
  .get();

var quantity = $('input[name="quantity[]"]')
  .map(function () {
    return this.value;
  })
  .get();

var locationVal = '';
var bucketVal = '';

$('#finish-btn').on('click', function (e) {
  e.preventDefault();
  getBucketDataList();

  Swal.fire({
    html: '<h4>DO YOU WANT TO INPUT A LOCATION?</h4>',
    text: '',
    icon: 'question',
    showDenyButton: true,
    confirmButtonColor: '#4a69bd',
    denyButtonColor: '#dc3545',
    confirmButtonText: 'YES',
    denyButtonText: 'NO',
    allowOutsideClick: false,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: '',
        html:
          '<form method="POST" autocomplete="off"><span>Location:</span><input type="text" list="locationList" id="location" name="location" class="swal2-input" placeholder="Location"><datalist id="locationList">' +
          getLocationDataList() +
          '</datalist><span>Bucket:</span>&nbsp;&nbsp;&nbsp<input type="text" list="bucketList" id="bucket" name="bucket" class="swal2-input" placeholder="Bucket"><datalist id="bucketList">' +
          getBucketDataList() +
          '</form>',
        confirmButtonText: 'OK',
        focusConfirm: false,
        allowOutsideClick: false,

        preConfirm: () => {
          const location = Swal.getPopup().querySelector('#location').value;
          const bucket = Swal.getPopup().querySelector('#bucket').value;

          var objLocation = $('#locationList').find(
            "option[value='" + location + "']"
          );
          var objBucket = $('#bucketList').find(
            "option[value='" + bucket + "']"
          );

          if (objLocation.length == 0 || objBucket.length == 0) {
            Swal.showValidationMessage(`INVALID LOCATION OR BUCKET`);
          }

          if (!location || !bucket) {
            Swal.showValidationMessage(`ALL FIELDS ARE REQUIRED`);
          }
          locationVal = location;
          bucketVal = bucket;
        },
      }).then((result) => {
        checkItem();
      });
    } else {
      checkItem();
    }
  });
  $(this).html('PLEASE WAIT');
  $(this).addClass('disable');
  $(this).blur();
});

//-----------------------FUNCTIONS---------------------------//

function getLocationDataList() {
  $.ajax({
    url: 'marlon_locationBucket.php?location=1',
    success: function (response) {
      $('#locationList').append(response);
    },
  });
}

function getBucketDataList() {
  $.ajax({
    url: 'marlon_locationBucket.php?bucket=1',
    success: function (response) {
      $('#bucketList').append(response);
    },
  });
}

function checkItem() {
  $('.loader').show();
  $.ajax({
    url: 'marlon_finishValidation.php',
    method: 'POST',
    data: {
      'finished_items[]': finished_items,
      finishBtn: 1,
    },
    success: function (resp) {
      if (resp != 3 && resp != 0) {
        $('.loader').fadeOut(300);
        Swal.fire({
          title: 'WARNING!',
          html: resp,
          icon: 'warning',
          confirmButtonColor: '#4a69bd',
          denyButtonText: `CANCEL`,
          showDenyButton: true,
          confirmButtonText: 'OK',
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            finishItems();
          } else if (result.isDenied) {
            swal.close();
            $('#finish-btn').removeClass('disable');
            $('#finish-btn').html('FINISH');
          }
        });
      }
      if (resp == 3) {
        $('.loader').fadeOut(300);
        Swal.fire({
          title: 'ALL ITEMS ARE ALREADY FINISHED!',
          icon: 'error',
          confirmButtonColor: '#4a69bd',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            window.localStorage.clear();
            window.location.href = 'index.php';
          }
        });
      }
      if (resp == 0) {
        finishItems();
      }
    },
  });
}

function finishItems() {
  $.ajax({
    url: 'marlon_finishAction.php',
    method: 'POST',
    data: {
      'finished_items[]': finished_items,
      'item_supplier[]': item_supplier,
      'item_name[]': item_name,
      'item_poNumber[]': item_poNumber,
      'item_desc[]': item_desc,
      'quantity[]': quantity,
      itemLocation: locationVal,
      itemBucket: bucketVal,
      finishBtn: 1,
    },
    success: function (data) {
      if (data == 'not set') {
        alert(data);
      } else {
        Swal.fire({
          icon: 'success',
          title: 'DONE!',
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: 1500,
        });
      }
      setTimeout(function () {
        window.location.href = 'index.php';
      }, 1600);
      $('.loader').fadeOut(300);
    },
  });
  window.localStorage.clear();
}

var ptag_array = [];
var lotNumber_array = [];

//push productionTag in a array
function pushPtag() {
  var ptagInput = document.getElementsByName('ptag[]');
  for (var i = 0; i < ptagInput.length; i++) {
    var inp = ptagInput[i];
    ptag_array.push(inp.value);
  }
}

//push lotNumber in a array
function pushLot() {
  var lotInput = document.getElementsByName('lot[]');
  for (var i = 0; i < lotInput.length; i++) {
    var inp2 = lotInput[i];
    lotNumber_array.push(inp2.value);
  }
}

//count table rows
function countRows() {
  var rowCount = $('.table tr').length;
  $('.item-count').val(rowCount);

  if (rowCount > 0) {
    $('.form-btn').removeClass('disable');
  } else {
    $('.form-btn').addClass('disable');
    localStorage.removeItem('supplier');
    rowCount = 0;
  }
}

//Removing Items
function removeRow() {
  $('.fa-times').on('click', function (e) {
    $(this).closest('tr').remove();
    var lot = $(this).closest('td').find('input[name="lot[]"]').val();
    var ptag = $(this).closest('td').find('input[name="ptag[]"]').val();
    lotNumber_array.splice($.inArray(lot, lotNumber_array), 1);
    ptag_array.splice($.inArray(ptag, ptag_array), 1);

    countRows();
    updateLocalStorage();
    $('#supplier_name').val(localStorage.supplier);
  });
}

//update localStorage
function updateLocalStorage() {
  var validationTable = $('#validation-table').html();
  localStorage.content = validationTable;
}

//check item tags
function checkInput() {
  var item_tags = $('#itemTags').val();
  $.ajax({
    url: 'marlon_validation.php?itemTag=' + item_tags,
    method: 'POST',
    success: function (response) {
      var respData = JSON.parse(response);
      if (respData.poContentId == 'none') {
        Swal.fire({
          title: respData.resp,
          icon: 'error',
          confirmButtonColor: '#4a69bd',
          confirmButtonText: 'OK',
        });
      } else if (
        localStorage.getItem('supplier') != null &&
        respData.supplier != localStorage.supplier
      ) {
        Swal.fire({
          title: 'WRONG SUBCON/SUPPLIER',
          icon: 'error',
          confirmButtonColor: '#4a69bd',
          confirmButtonText: 'OK',
        });
      } else {
        $('tbody').append(
          '<tr><td><input type="hidden" name="ptag[]" value="' +
            respData.PTAG +
            '"></input><input type="hidden" name="lot[]" value="' +
            respData.lot +
            '"></input><input type="hidden" value="' +
            item_tags +
            '" name="item_list_input[]"></input><input type="hidden" value="' +
            respData.poContentId +
            '" name="poContent_list_input[]"></input><b>' +
            item_tags +
            '</b><span><i class="fa fa-times"></i></span></td></tr>'
        );

        $('.form-btn').prop('disabled', false);
        countRows();
        removeRow();
        pushPtag();
        pushLot();
        updateLocalStorage();

        if (localStorage.getItem('supplier') === null) {
          localStorage.setItem('supplier', respData.supplier);
          $('#supplier_name').val(localStorage.supplier);
        }
      }
      $('.btn-outlined').html('ADD');
      $('.search-input').val('');
      $('.search-input').prop('readonly', false);
      $('.loader').fadeOut(300);
    },
  });
}
