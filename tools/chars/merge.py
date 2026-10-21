import bpy,sys,os
argv=sys.argv[sys.argv.index('--')+1:]
ual1,ual2,dst=argv
KEEP=set("Idle_Loop Idle_Talking_Loop Walk_Loop Walk_Formal_Loop Jog_Fwd_Loop Sprint_Loop Sitting_Enter Sitting_Exit Sitting_Idle_Loop Sitting_Talking_Loop Dance_Loop Interact PickUp_Table Driving_Loop Crouch_Idle_Loop Push_Loop Consume Idle_FoldArms_Loop Idle_No_Loop Idle_TalkingPhone_Loop Idle_Rail_Loop Idle_Rail_Call Yes Walk_Carry_Loop Chest_Open".split())
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=ual2)
arm=[o for o in bpy.data.objects if o.type=='ARMATURE'][0]
mesh=[o for o in bpy.data.objects if o.type=='MESH']
base_actions=set(a.name for a in bpy.data.actions)
bpy.ops.import_scene.gltf(filepath=ual1)
# zweite Armature + Mesh wieder löschen, Actions bleiben
for o in list(bpy.data.objects):
    if o is arm or o in mesh:continue
    bpy.data.objects.remove(o,do_unlink=True)
for a in list(bpy.data.actions):
    n=a.name.split('|')[-1]
    a.name=n
# Doppelte (z. B. A_TPose aus beiden) und nicht gebrauchte entfernen
seen=set()
for a in list(bpy.data.actions):
    if a.name not in KEEP or a.name in seen:bpy.data.actions.remove(a)
    else:seen.add(a.name)
print('ACTIONS',sorted(a.name for a in bpy.data.actions))
if arm.animation_data is None:arm.animation_data_create()
arm.animation_data.action=None
for tr in list(arm.animation_data.nla_tracks):arm.animation_data.nla_tracks.remove(tr)
for act in bpy.data.actions:
    tr=arm.animation_data.nla_tracks.new();tr.name=act.name;st=tr.strips.new(act.name,int(act.frame_range[0]),act);st.name=act.name
print('MESH',[(m.name,len(m.data.vertices),[ms.material.name for ms in m.material_slots]) for m in mesh],'BONES',len(arm.data.bones))
bpy.ops.export_scene.gltf(filepath=dst,export_format='GLB',export_animations=True,export_skins=True,export_apply=True,export_yup=True)
print('OK',os.path.getsize(dst))
