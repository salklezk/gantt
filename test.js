gantt.config.layout = {
  css: "gantt_container",
  rows:[
      {
         cols: [
          {
            // the default grid view  
            view: "grid",  
            scrollX:"scrollHor", 
            scrollY:"scrollVer"
          },
          { resizer: true, width: 1 },
          {
            // the default timeline view
            view: "timeline", 
            scrollX:"scrollHor", 
            scrollY:"scrollVer"
          },
          {
            view: "scrollbar", 
            id:"scrollVer"
          }
      ]},
      {
          view: "scrollbar", 
          id:"scrollHor"
      }
  ]
  
}


/*gantt.parse({
  data: [
    {id: 1, text: "Task #1", start_date: "2025-06-10", duration: 4, progress: 0.6, resource: "dev"},
    {id: 2, text: "Task #2", start_date: "2025-06-12", duration: 3, progress: 0.4, resource: "qa"}
  ],
  collections: {
    resource: [
      {key: "dev", label: "Developer"},
      {key: "qa", label: "QA"},
      {key: "pm", label: "Project Manager"}
    ]
  }
});*/

gantt.config.types = {
  project: "project",
  phase: "phase",
  task: "task",
  assignment: "assignment" // Keep original if needed
};

gantt.config.task_types = {
  project: ["phase", "task", "assignment"],
  phase: ["task", "assignment"],
  task: ["assignment"],
  assignment: [] // No children allowed
};
gantt.locale.labels.type_project = "Project";
gantt.locale.labels.type_phase = "Phase";
gantt.locale.labels.type_assignment = "Assignment";
gantt.locale.labels.type_task = "Task";
gantt.locale.labels["assignment_button"] = "Options for assignment";

gantt.attachEvent("onGanttReady", function(){                               
  gantt.config.buttons_right = ["assignment_button","gantt_delete_btn"];                                 
});   

gantt.attachEvent("onLightboxButton", function(button_id, node, e){
  if(button_id == "assignment_button"){
    alert('a');
    gantt.config.lightbox.sections = [
      {name: "time", type: "duration", map_to: "auto"}
    ];
      var id = gantt.getState().lightbox;
   //   gantt.getTask(id).progress = 1;
    //  gantt.updateTask(id);
   //   gantt.hideLightbox();
  }
});
//gannt.config.buttons__right = ["gantt_save_btn", "gantt_cancel_btn"]
function getResourceOptions() {
  return [
    { key: "dev", label: "Developer" },
    { key: "qa", label: "QA" },
    { key: "pm", label: "PM" }
  ];
}

gantt.locale.labels.section_owner ="Owners";

gantt.attachEvent("onLightboxButton",function(css,node,e){
//alert(css);
});

gantt.config.show_lightbox = function(id) {
  const task = gantt.getTask(id);
  return !(task.type === "assignment" || task.type === "baseline");
};

gantt.attachEvent("onBeforeLightBox", function(id){
  const task = gantt.getTask(id);
  
 
  if(task.parent == 0){
    gantt.config.lightbox.sections = [
      {name: "description", height: 70, map_to: "text", type: "textarea", focus: true},
      {name: "type", type: "typeselect", map_to: "type"},
      {name: "time", type: "duration", map_to: "auto"},
      {name: "owner", type: "resources", options: getResourceOptions()}
    //  {name: "add_assignment", height: 150, type: "template", map_to: "_assignment"}
    ];
    return true;
  }
  /*if(gantt.getTask(task.parent).type=="assignment") {
    gantt.deleteTask(id);
    return false;
  }*/
  
  // Dynamic child type options
  const typeSection = {
    name: "child_type",
    type: "select",
    map_to: "type",
    options: gantt.config.task_types[gantt.getTask(task.parent).type].map(type => ({
      key: type,
      label: type.charAt(0).toUpperCase() + type.slice(1)
    }))
  };
  gantt.config.lightbox.sections = [
    {name: "description", height: 70, map_to: "text", type: "textarea"},
    {name: "time", type: "duration", map_to: "auto"},
    typeSection,
    {name: "owner", type: "resources", options: getResourceOptions()},
  //  {name: "add_assignment", height: 150, type: "template", map_to: "_assignment"}
  ];
  
  return true;
});
gantt.templates.task_text = function(start, end, task){
  return task.type ;
}
gantt.templates.task_class = function(start, end, task){
      return task.type;
  }


  gantt.attachEvent("onBeforeLinkAdd", function(id, link){
    const source = gantt.getTask(link.source);
    const target = gantt.getTask(link.target);
    
    // Block dependencies involving assignments
    if(source.type === "assignment" || target.type === "assignment") {
      return false;
    }
    return true;
  });

 
  function getAllocationOptions() {
    return [
      { key: 25, label: "25%" },
      { key: 50, label: "50%" },
      { key: 75, label: "75%" },
      { key: 100, label: "100%" }
    ];
  }
 

gantt.init("gantt_here");
gantt.locale.labels.section_child_type = "Subject";


 /* gantt.serverList("people", [
    {key: 1, label: "John"},
    {key: 2, label: "Mike"},
    {key: 3, label: "Anna"},
    {key: 4, label: "Bill"},
    {key: 7, label: "Floe"}
]);

gantt.config.lightbox.phase_sections = [
  {name:"title", height:25, map_to:"text", type:"textarea", focus:true},
  {name:"description", height:70, map_to: "details", type: "textarea"},
  {name:"type1", type:"typeselect", map_to:"type"},
  {name:"time", height:72, type:"time", map_to:"auto"},
  {name:"owner", map_to:"owner_id", type:"select", options:gantt.serverList("people")}
];
gantt.config.lightbox.sections = [
  {name: "description", height: 70, map_to: "text", type: "textarea", focus: true},
  {name: "type", type: "typeselect", map_to: "type"},
  {name: "time", type: "duration", map_to: "auto"}
];
gantt.locale.labels.section_title = "Subject";
gantt.locale.labels.section_description = "Details";

gantt.locale.labels.type1_assignment = "Assignment";
gantt.locale.labels.section_resources = "owner";
gantt.templates.task_class = function(start, end, task){
  if(task.type == gantt.config.types.project){
      return "project_task";
  }
  return "";
};

  return task.text;
};
*/
 