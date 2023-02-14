var budgetController=(function(){

    let Income= function(id,description,value){
        this.id=id,
        this.description=description,
        this.value=value
    };

    let Expense= function(id,description,value){
        this.id=id,
        this.description=description,
        this.value=value,
        this.percentage=-1
    };
    // add percentage method to expense oject
    Expense.prototype.calcPercentage=function(totalIncome){

        if(totalIncome>0){
            this.percentage=Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage=-1;
        }
        
    }
    // add getpercentage method to expense object
    Expense.prototype.getPercentage=function(){
        return this.percentage;
    }

    //sum of total income
    let calculateTotal= function(type){
        var sum=0;
        data.allItems[type].forEach((element)=>{
            sum+=element.value;
        });
        data.total[type]=sum;
    }
    //structure of data
    let data={
        allItems:{
            exp:[],
            inc:[]
        },
        total:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage:-1
    };

    // all the items access from other module
    return{

        addItem: function(type,des,val){

            //creating ID
            if(data.allItems[type].length==0){
                ID=0;
            }else{
                ID=data['allItems'][type][data.allItems[type].length-1].id+1;
            }
            //creating new items based on inc or exp type
            if(type==='inc'){
                var newItems=new Income(ID,des,val);
            }else if(type==='exp'){
                var newItems=new Expense(ID,des,val);
            }

            //push the new item to the data structure
            data.allItems[type].push(newItems);

            //return newItems
            return newItems
        },

        deleteItem: function(type,id){
            let ids,index;

            ids=data.allItems[type].map(function(element){
                return element.id;
            });

            index=ids.indexOf(id);
            if(index!==-1){
                data.allItems[type].splice(index,1);
            }
          
        },

        calculateBudget: function(){
           //calculate total income or expense
           calculateTotal('exp');
           calculateTotal('inc');

           //calculate the budget
           data.budget=data.total.inc-data.total.exp;

           //calculate percentage of income that we spent
           if(data.total.inc>0){
                data.percentage=Math.round((data.total.exp/data.total.inc)*100);
           }else{
               data.percentage=-1;
           }
        },
        calculatePercentage: function(){
            //iterating entire expense array and add the method
            data.allItems.exp.forEach((el)=>{
                el.calcPercentage(data.total.inc);
            });
        },
        getPercentage: function(){
            //extract the percentage from entire expense array
            let percentage=data.allItems.exp.map((el)=>{
                return el.getPercentage();
            });
            return percentage;
        },
        getBudget: function(){

            return{
                budget: data.budget,
                percentage: data.percentage,
                totalIncome: data.total.inc,
                totalExpenses: data.total.exp
            }
        },
        test: function(){
            console.log(data);
        }
    }
    
})();




var UIController=(function(){

    var DOMstrings={
        inputBtn: 'add__btn',
        inputType: 'add__type',
        inputDescription: 'add__description',
        inputValue: 'add__value',
        incomeContainer: 'income__list',
        expenseContainer: 'expenses__list',
        inputValueQuery: '.add__value',
        inputDescriptionQuery: '.add__description',
        inputTypeQuery: '.add__type',
        budgetLabel: 'budget__value',
        incomeLabel: 'budget__income--value',
        expenseLabel: 'budget__expenses--value',
        percentageLabel: 'budget__expenses--percentage',
        container: 'container',
        expensePercentageLable: '.item__percentage',
        dateLabel: 'budget__title--month',
    };
    
     var formatNumber= function(num,type){
         var numSplit,int,dec,type;

        num=Math.abs(num);
        num=num.toFixed(2);

        numSplit=num.split('.');

        int= numSplit[0];
        
        if(int.length>3){
            int=int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
        }
        dec=numSplit[1];

        return (type==='exp'? '-' : '+')+' '+int +'.' +dec;
    };

     //iterate entire the list
    var nodeListForEach= function(list,callback){
        for(var i=0;i<list.length;i++){
            callback(list[i],i);
        }
    };

    return{
        getInput: function(){
            return{
                type: document.getElementsByClassName(DOMstrings.inputType)[0].value,
                description: document.getElementsByClassName(DOMstrings.inputDescription)[0].value,
                value: parseFloat(document.getElementsByClassName(DOMstrings.inputValue)[0].value)
            };
        },
        addListItem: function(obj,type){
            let html,newHtml,element;

            //create HTML string with placeholder text
            if(type==='inc'){
                element=DOMstrings.incomeContainer;
                html= '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type==='exp'){
                element=DOMstrings.expenseContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            //replace the placeholder text from actual data

            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));

            //insert the HTML into the DOM

            document.getElementsByClassName(element)[0].insertAdjacentHTML('beforeend',newHtml);

        },
        deleteListItem: function(selectorId){
            let el=document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        clearField: function(){
            let field,fieldArr;

            //access the input field
            field=document.querySelectorAll(DOMstrings.inputValueQuery + ','+ DOMstrings.inputDescriptionQuery);

            //convert into the array
            fieldArr=Array.prototype.slice.call(field);

            //itetating in the array
            fieldArr.forEach((element,index,array) => {
                //clear the field value
                element.value = "";
            });

            //focus the input field description
            fieldArr[0].focus();
        },
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type='inc':type='exp';

            document.getElementsByClassName(DOMstrings.budgetLabel)[0].textContent=formatNumber(obj.budget,type);
            document.getElementsByClassName(DOMstrings.incomeLabel)[0].textContent=formatNumber(obj.totalIncome,'inc');
            document.getElementsByClassName(DOMstrings.expenseLabel)[0].textContent=formatNumber(obj.totalExpenses,'exp');
        
            if(obj.percentage>0){
                document.getElementsByClassName(DOMstrings.percentageLabel)[0].textContent=obj.percentage +'%';
            }else{
                document.getElementsByClassName(DOMstrings.percentageLabel)[0].textContent='___';
            }
        },
        displayPercentage: function(percentages){
            //access all percentage label in the expense
           var field= document.querySelectorAll(DOMstrings.expensePercentageLable);

           //1st method to put the value of percentage

           //finally put the value
           nodeListForEach(field,function(curr,index){
               
                if(percentages[index]>0){
                    curr.textContent=percentages[index]+ '%';
                }else{
                    curr.textContent='___'
                }
           });

           //2nd method to put the percentage value
           /*
            field.forEach((element,index)=>{
                if(percentages[index]>0){
                    element.textContent=percentages[index]+ '%';
                }else{
                    element.textContent='___'
                }
            });
            
            */
           
        },
        displayMonth: function(){
            let month,monthName,year,now;

            now=new Date();
            year=now.getFullYear();
            month=now.getMonth();
            monthName=['January','February','March','April','May','June','July','August','September','October','November','December'];

            document.getElementsByClassName(DOMstrings.dateLabel)[0].textContent=monthName[month]+" "+year;

        },
        changeType : function(){
            var fields=document.querySelectorAll(DOMstrings.inputTypeQuery +','+ DOMstrings.inputValueQuery +','+ DOMstrings.inputDescriptionQuery);

            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });
            document.getElementsByClassName(DOMstrings.inputBtn)[0].classList.toggle('red');
        },
        getDOMstrings: function(){
            return DOMstrings;
        }
    };
})();




var appController=(function(budgetCtrl,UICtrl){

    var setupEventListener=function(){
        var DOM=UICtrl.getDOMstrings();
        var addBtn=document.getElementsByClassName(DOM.inputBtn)[0];

        addBtn.addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(e){
            if(e.keyCode===13 || e.which===13){
                ctrlAddItem();
            }
         });
        
         document.getElementsByClassName(DOM.container)[0].addEventListener('click',ctrlDeleteItem);
         document.querySelector(DOM.inputTypeQuery).addEventListener('change',UICtrl.changeType);
    }

    let updateBudget=function(){

        // 1. calculate budget
        budgetController.calculateBudget();

        // 2. return the budget
        var budget=budgetController.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);


    };
    
    let updatePercentages= function(){
        // 1. calculate percentage
        budgetController.calculatePercentage();

        // 2. return the percentage3
        let percentage=budgetController.getPercentage();

        // 3. display the percentage on UI
        UICtrl.displayPercentage(percentage);
    };

    let ctrlAddItem=function(){
        
        var input,newItems
        // 1. get the input value
        input=UICtrl.getInput();

        if(input.description!="" && !isNaN(input.value) && input.value>0){

            // 2. add the item to the budget ctrlr
            newItems=budgetCtrl.addItem(input.type,input.description,input.value);

            // 3. add the item to UI
            UICtrl.addListItem(newItems,input.type);

            // 4. clear input field
            UICtrl.clearField();

            // 5. update budget 

            updateBudget();

            //6. update percentage

            updatePercentages();
        }
    };
    let ctrlDeleteItem= function(e){
        let itemId,splitId,type,ID;

        itemId=e.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId){
            splitId=itemId.split('-');
            type=splitId[0];
            ID= parseInt(splitId[1]);

            // 1. Delete the item from the data strucuture
            
            budgetCtrl.deleteItem(type,ID);

            // 2. Delete the item form UI
            UICtrl.deleteListItem(itemId);

            // 3. Update and show the new budget 
            updateBudget()

            //4. update percentage

            updatePercentages();
        }
    };

    return{
        init: function(){
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalIncome: 0,
                totalExpenses: 0
            });
            setupEventListener();
        }
    };

})(budgetController,UIController);

appController.init();