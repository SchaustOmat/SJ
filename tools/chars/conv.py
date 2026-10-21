import bpy,sys,os
argv=sys.argv[sys.argv.index('--')+1:]
src,dst=argv[0],argv[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=src,use_anim=True,anim_offset=0.0,ignore_leaf_bones=False,automatic_bone_orientation=False)
arm=[o for o in bpy.data.objects if o.type=='ARMATURE']
meshes=[o for o in bpy.data.objects if o.type=='MESH']
print('ARMATURES',[(a.name,len(a.data.bones)) for a in arm]);print('MESHES',[(m.name,len(m.data.vertices)) for m in meshes]);print('ACTIONS',len(bpy.data.actions),[a.name for a in bpy.data.actions][:60])
# alle Actions als NLA-Strips an die Armature hängen, damit der glTF-Export jede als eigene Animation schreibt
if arm:
    a=arm[0]
    if a.animation_data is None:a.animation_data_create()
    a.animation_data.action=None
    for act in bpy.data.actions:
        tr=a.animation_data.nla_tracks.new();tr.name=act.name;st=tr.strips.new(act.name,int(act.frame_range[0]),act);st.name=act.name
bpy.ops.export_scene.gltf(filepath=dst,export_format='GLB',export_animations=True,export_animation_mode='ACTIONS' if hasattr(bpy.types,'GLTF_PT_export_animation') else 'ACTIONS',export_skins=True,export_apply=True,export_yup=True)
print('OK',dst,os.path.getsize(dst))
