var ObservableArray = require("data/observable-array").ObservableArray;

function CustomMessages(items) {
    var viewModel = new ObservableArray(items);

    // load data from application settings
    viewModel.load = function() {
        
       viewModel.push({
                    
                });
       
    };

    // be sure to delete data from application settings
    viewModel.empty = function() {
        while (viewModel.length > 3) {
            viewModel.pop();
        }
    };

    // add data to application settings
    viewModel.add = function(data) {
        
        viewModel.push({
            message: data,
            type: 'message',
            level: 'content',
            isSelected: false,
        });
    };

    // delete data from application settings
    viewModel.delete = function(index) {
        viewModel.splice(index, 1);
    };

    return viewModel;
}

module.exports = CustomMessages;